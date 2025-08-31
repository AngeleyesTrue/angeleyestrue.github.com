# API 설계 명세서

## Supabase 스키마 설계

### 인증 및 사용자 관리

#### 기본 사용자 테이블 (auth.users 확장)
```sql
-- 사용자 프로필 확장
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 프로필만 수정 가능" ON user_profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "모든 사용자 프로필 조회 가능" ON user_profiles
  FOR SELECT USING (true);
```

---

## 1. Personal Profile API

### 사진 갤러리 스키마
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(50),
  tags TEXT[],
  taken_at TIMESTAMP,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 사진만 관리 가능" ON photos
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "공개 사진은 모든 사용자 조회 가능" ON photos
  FOR SELECT USING (is_public = true);
```

### 장비 관리 스키마
```sql
CREATE TABLE equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'audio', 'keyboard', 'camera', 'other'
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  description TEXT,
  specifications JSONB,
  image_urls TEXT[],
  condition VARCHAR(20), -- 'new', 'excellent', 'good', 'fair'
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 장비만 관리 가능" ON equipments
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "공개 장비는 모든 사용자 조회 가능" ON equipments
  FOR SELECT USING (is_public = true);
```

### 클라이언트 API 함수
```javascript
// 사진 업로드
async function uploadPhoto(file, metadata) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `photos/${fileName}`
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file)
    
  if (error) throw error
  
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)
    
  return await supabase.from('photos').insert({
    ...metadata,
    image_url: urlData.publicUrl,
    user_id: (await supabase.auth.getUser()).data.user.id
  })
}

// 장비 등록
async function addEquipment(equipment) {
  return await supabase.from('equipments').insert({
    ...equipment,
    user_id: (await supabase.auth.getUser()).data.user.id
  })
}
```

---

## 2. Career Profile API

### 경력 정보 스키마
```sql
CREATE TABLE career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(100) NOT NULL,
  company_logo_url TEXT,
  department VARCHAR(100),
  position VARCHAR(100),
  employment_type VARCHAR(20), -- 'full-time', 'part-time', 'contract', 'intern'
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  achievements TEXT[],
  technologies TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 경력만 관리 가능" ON career_profiles
  FOR ALL USING (auth.uid() = user_id);
-- Career Profile은 임시 URL을 통해서만 접근하므로 별도 조회 정책 없음
```

### 임시 링크 관리 스키마
```sql
CREATE TABLE profile_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(8) UNIQUE NOT NULL,
  title VARCHAR(100),
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_access_count INTEGER,
  access_count INTEGER DEFAULT 0
);

-- 접근 로그
CREATE TABLE profile_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES profile_links(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

-- RLS 정책
ALTER TABLE profile_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "관리자만 링크 생성 및 관리 가능" ON profile_links
  FOR ALL USING (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ));
CREATE POLICY "유효한 링크는 조회 가능" ON profile_links
  FOR SELECT USING (is_active = true AND expires_at > NOW());
```

### 클라이언트 API 함수
```javascript
// 임시 링크 생성 (관리자만)
async function createProfileLink(linkData) {
  const shortCode = generateShortCode() // 6자리 영숫자 생성
  
  return await supabase.from('profile_links').insert({
    ...linkData,
    short_code: shortCode,
    user_id: (await supabase.auth.getUser()).data.user.id
  })
}

// 링크 유효성 검증
async function validateProfileLink(shortCode) {
  const { data, error } = await supabase
    .from('profile_links')
    .select('*')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()
    
  if (data) {
    // 접근 로그 기록
    await supabase.from('profile_access_logs').insert({
      link_id: data.id,
      ip_address: getUserIP(),
      user_agent: navigator.userAgent
    })
    
    // 접근 횟수 증가
    await supabase.from('profile_links')
      .update({ access_count: data.access_count + 1 })
      .eq('id', data.id)
  }
  
  return data
}
```

---

## 3. Tag Search Service API

### 무한 계층 태그 스키마
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  depth INTEGER DEFAULT 0,
  path TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN parent_id IS NULL THEN name
      ELSE (SELECT path FROM tags p WHERE p.id = parent_id) || '/' || name
    END
  ) STORED,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 태그 계층 인덱스
CREATE INDEX idx_tags_parent_user ON tags(parent_id, user_id);
CREATE INDEX idx_tags_path ON tags USING gin(path gin_trgm_ops);

-- RLS 정책
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 태그만 관리 가능" ON tags
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "공개 태그는 모든 사용자 조회 가능" ON tags
  FOR SELECT USING (is_public = true);
```

### 콘텐츠 및 연결 스키마
```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content_type VARCHAR(20) NOT NULL, -- 'link', 'text', 'file'
  content_data TEXT NOT NULL,
  metadata JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, tag_id)
);

-- 전문 검색을 위한 인덱스
CREATE INDEX idx_contents_search ON contents USING gin(to_tsvector('korean', title || ' ' || description));
CREATE INDEX idx_content_tags ON content_tags(tag_id, content_id);

-- RLS 정책
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 콘텐츠만 관리 가능" ON contents
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "공개 콘텐츠는 모든 사용자 조회 가능" ON contents
  FOR SELECT USING (is_public = true);

ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "콘텐츠 소유자만 태그 연결 관리 가능" ON content_tags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM contents WHERE id = content_id AND user_id = auth.uid()
  ));
```

### 클라이언트 API 함수
```javascript
// 태그 트리 조회
async function getTagTree(parentId = null, userId) {
  return await supabase
    .from('tags')
    .select('*')
    .eq('parent_id', parentId)
    .eq('user_id', userId)
    .order('name')
}

// 태그별 콘텐츠 검색
async function searchContentsByTags(tagIds, userId) {
  return await supabase
    .from('contents')
    .select(`
      *,
      content_tags!inner(tag_id),
      tags:content_tags(tags(*))
    `)
    .eq('user_id', userId)
    .in('content_tags.tag_id', tagIds)
}

// 계층 경로로 태그 검색
async function getTagByPath(path, userId) {
  return await supabase
    .from('tags')
    .select('*')
    .eq('path', path)
    .eq('user_id', userId)
    .single()
}
```

---

## Storage 설계

### Supabase Storage 버킷 구조
```sql
-- 이미지 버킷 (Public)
CREATE BUCKET IF NOT EXISTS 'images' WITH (public = true);

-- 파일 버킷 (Private)  
CREATE BUCKET IF NOT EXISTS 'files' WITH (public = false);

-- Storage RLS 정책
CREATE POLICY "사용자는 자신의 이미지만 업로드 가능" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "사용자는 자신의 이미지만 삭제 가능" ON storage.objects  
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "모든 이미지 조회 가능" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
```

### 파일 업로드 헬퍼
```javascript
// 이미지 업로드 및 썸네일 생성
async function uploadImage(file, folder = 'general') {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${folder}/${fileName}`
  
  // 원본 업로드
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) throw error
  
  // 썸네일 URL 생성
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath, {
      transform: {
        width: 300,
        height: 300,
        resize: 'cover'
      }
    })
    
  return {
    originalUrl: supabase.storage.from('images').getPublicUrl(filePath).data.publicUrl,
    thumbnailUrl: urlData.publicUrl
  }
}
```

---

## 실시간 기능

### Supabase Realtime 설정
```javascript
// 태그 변경사항 실시간 구독
const tagSubscription = supabase
  .channel('tag_changes')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'tags',
      filter: `user_id=eq.${userId}`
    }, 
    (payload) => {
      console.log('태그 변경:', payload)
      refreshTagTree()
    }
  )
  .subscribe()

// 콘텐츠 변경사항 실시간 구독  
const contentSubscription = supabase
  .channel('content_changes')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public', 
      table: 'contents',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('콘텐츠 변경:', payload)
      refreshContentList()
    }
  )
  .subscribe()
```

---

## 에러 처리 및 검증

### 클라이언트 사이드 검증
```javascript
// 태그 이름 검증
function validateTagName(name) {
  if (!name || name.trim().length === 0) {
    throw new Error('태그 이름은 필수입니다')
  }
  if (name.length > 50) {
    throw new Error('태그 이름은 50자 이하여야 합니다')
  }
  if (!/^[a-zA-Z0-9가-힣\s\-_]+$/.test(name)) {
    throw new Error('태그 이름에 특수문자를 사용할 수 없습니다')
  }
  return name.trim()
}

// Short code 생성 및 검증
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 에러 처리 래퍼
async function apiCall(fn) {
  try {
    const result = await fn()
    if (result.error) {
      throw new Error(result.error.message)
    }
    return result.data
  } catch (error) {
    console.error('API 호출 오류:', error)
    throw error
  }
}
```

---

## 성능 최적화

### 쿼리 최적화
```javascript
// 페이지네이션
async function getPhotosWithPagination(page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  return await supabase
    .from('photos')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(from, to)
}

// 태그 트리 캐싱
const tagTreeCache = new Map()

async function getCachedTagTree(parentId, userId) {
  const cacheKey = `${userId}-${parentId || 'root'}`
  
  if (tagTreeCache.has(cacheKey)) {
    return tagTreeCache.get(cacheKey)
  }
  
  const data = await getTagTree(parentId, userId)
  tagTreeCache.set(cacheKey, data)
  
  // 5분 후 캐시 삭제
  setTimeout(() => tagTreeCache.delete(cacheKey), 300000)
  
  return data
}
```

---

## 보안 고려사항

### 추가 RLS 정책
```sql
-- 관리자 권한 확인 함수
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 프로필 링크 관리 정책
CREATE POLICY "관리자만 프로필 링크 생성 가능" ON profile_links
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "링크 소유자만 수정 가능" ON profile_links
  FOR UPDATE USING (auth.uid() = user_id);
```

### 클라이언트 보안 검증
```javascript
// 파일 타입 검증
function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('JPEG, PNG, WebP 파일만 업로드 가능합니다')
  }
  
  if (file.size > maxSize) {
    throw new Error('파일 크기는 5MB 이하여야 합니다')
  }
  
  return true
}

// XSS 방지
function sanitizeInput(input) {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}
```