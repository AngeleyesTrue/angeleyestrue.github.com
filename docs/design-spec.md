# 개인 프로필 플랫폼 설계 명세서

## 프로젝트 개요
Frontend-only 아키텍처 기반의 개인 프로필 및 태그 검색 플랫폼

---

## 핵심 기능 분류

### 1. Personal Profile (개인 프로필)
**목적**: 개인적 관심사와 소유 장비를 체계적으로 정리하는 공개 프로필

#### 기능 상세
- **사진 갤러리**
  - 개인 사진 업로드 및 관리
  - 썸네일 자동 생성
  - 카테고리별 분류 (여행, 취미, 일상 등)
  
- **장비 관리**
  - 음향 기기 등록 (브랜드, 모델, 구매일, 사진)
  - 키보드 컬렉션 (스위치 타입, 키캡, 레이아웃)
  - 기타 개인 장비 아카이브
  
- **관심사 기록**
  - 취미 및 관심 분야 정리
  - 개인적 메모 및 후기

#### 접근 권한
- **공개**: 누구나 접근 가능
- **편집**: 로그인한 소유자만 가능

#### 데이터 구조
```sql
-- 개인 프로필 기본 정보
CREATE TABLE personal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  display_name VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 사진 갤러리
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(200),
  description TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(50),
  taken_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 장비 관리
CREATE TABLE equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  category VARCHAR(50), -- 'audio', 'keyboard', 'other'
  brand VARCHAR(100),
  model VARCHAR(100),
  purchase_date DATE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2. Career Profile (경력 프로필)
**목적**: 회사 이력과 업무 성과를 시간순으로 정리한 제한적 접근 프로필

#### 기능 상세
- **회사 이력 관리**
  - 회사명, 부서, 직책, 재직기간
  - 주요 업무 및 성과 기록
  - 프로젝트별 상세 설명
  
- **임시 URL 시스템**
  - 관리자가 생성하는 6자리 short-code
  - 설정 가능한 만료일
  - 접근 로그 및 통계

#### 접근 권한
- **제한적**: 특정 URL (`profile.angeleyes.kr/profile/{code}`)로만 접근
- **만료**: 설정된 날짜 이후 접근 차단
- **편집**: 로그인한 소유자만 가능

#### 데이터 구조
```sql
-- 경력 정보
CREATE TABLE career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  achievements TEXT[],
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 임시 접근 링크
CREATE TABLE profile_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(8) UNIQUE NOT NULL,
  title VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  access_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 접근 로그
CREATE TABLE profile_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES profile_links(id),
  accessed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

---

### 3. Tag Search Service (태그 검색 서비스)
**목적**: 무한 계층 태그 시스템으로 데이터를 체계적으로 저장하고 검색하는 서비스

#### 기능 상세
- **무한 계층 태그 구조**
  - 계층적 드릴다운 네비게이션
  - 예: `개발 → C# → Web → ASP.NET → API`
  - Breadcrumb 경로 표시
  
- **콘텐츠 관리**
  - 링크, 텍스트, 파일 저장
  - 태그별 분류 및 검색
  - 다중 태그 조합 검색
  
- **사용자 확장**
  - 개인용으로 시작
  - 향후 다중 사용자 지원 계획

#### 접근 권한
- **현재**: 개인 사용 (로그인 필요)
- **향후**: 다중 사용자 지원 계획

#### 데이터 구조
```sql
-- 무한 계층 태그 시스템
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES tags(id),
  depth INTEGER DEFAULT 0,
  path TEXT, -- 전체 경로: "개발/C#/Web/ASP.NET"
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 콘텐츠 저장
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content_type VARCHAR(20), -- 'link', 'text', 'file'
  content_data TEXT, -- URL 또는 텍스트 내용
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 태그와 콘텐츠 연결
CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## UI/UX 설계 방향

### 네비게이션 구조
```
메인 페이지
├── Personal Profile (개인 프로필)
│   ├── 사진 갤러리
│   ├── 장비 컬렉션
│   └── 관심사
├── Career Profile (경력 프로필) 
│   ├── 회사 이력
│   └── 프로젝트 성과
└── Tag Search (태그 검색)
    ├── 태그 트리 네비게이션
    ├── 콘텐츠 검색
    └── 즐겨찾기
```

### 태그 시스템 UI 패턴
- **Miller Columns**: 3단 컬럼으로 상위-현재-하위 표시
- **Breadcrumb Navigation**: 현재 경로 표시
- **Chip-based Selection**: 선택된 태그들을 상단에 표시

### 공통 컴포넌트
- **Header**: 네비게이션 + 로그인 상태
- **Sidebar**: 기능별 메뉴
- **Modal**: 등록/편집 폼
- **Loading**: 데이터 로딩 상태

---

## 개발 우선순위

### Phase 1: 기본 인프라 (1-2주)
1. Supabase 연동 및 인증 시스템
2. 기본 라우팅 및 레이아웃
3. 공통 컴포넌트 개발

### Phase 2: Personal Profile (2-3주)
1. 사진 갤러리 CRUD
2. 장비 관리 시스템
3. 관심사 기록 기능

### Phase 3: Tag Search Service (3-4주)
1. 무한 계층 태그 시스템
2. 콘텐츠 등록 및 검색
3. Miller Columns UI 구현

### Phase 4: Career Profile (2주)
1. 경력 정보 관리
2. 임시 URL 생성 시스템
3. 접근 로그 및 통계

---

## 기술적 고려사항

### 보안
- **RLS 정책**: 사용자별 데이터 격리
- **JWT 검증**: 클라이언트 사이드 토큰 관리
- **URL 만료**: 시간 기반 접근 제어

### 성능
- **코드 분할**: React lazy loading 활용
- **이미지 최적화**: Supabase Storage transform API
- **캐싱**: 태그 트리 구조 로컬 캐싱

### 사용자 경험
- **반응형 디자인**: 모바일 우선
- **실시간 업데이트**: Supabase realtime 활용
- **오프라인 지원**: 기본 데이터 캐싱

---

## 다음 단계
1. 가장 간단한 Personal Profile부터 시작
2. Supabase 스키마 생성 및 RLS 정책 설정
3. 기본 인증 및 CRUD 컴포넌트 구현