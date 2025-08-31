# 개발 계획서

## 개발 우선순위 및 일정

### Phase 1: 기본 인프라 구축 (1-2주)
**목표**: 프로젝트 기반 설정 및 인증 시스템 구현

#### 1.1 환경 설정 (2-3일)
- [ ] Supabase 프로젝트 연동 확인
- [ ] React Router 업그레이드 (v6 기준)
- [ ] Supabase JavaScript SDK 설치 및 설정
- [ ] 환경 변수 관리 시스템 구축

#### 1.2 인증 시스템 (3-4일)
- [ ] Google OAuth 설정
- [ ] 로그인/로그아웃 컴포넌트
- [ ] 사용자 세션 관리
- [ ] Protected Route 구현
- [ ] 사용자 프로필 기본 정보

#### 1.3 공통 컴포넌트 (2-3일)
- [ ] Layout 컴포넌트 (Header, Sidebar, Footer)
- [ ] Navigation 시스템 업데이트
- [ ] Loading 및 Error 상태 컴포넌트
- [ ] Modal 및 Toast 알림 시스템

---

### Phase 2: Personal Profile 구현 (2-3주)
**목표**: 가장 간단한 개인 프로필 기능부터 구현

#### 2.1 사진 갤러리 (1주)
- [ ] 사진 업로드 컴포넌트
- [ ] 갤러리 그리드 레이아웃
- [ ] 이미지 미리보기 및 확대
- [ ] 카테고리별 필터링
- [ ] 사진 삭제 및 편집

**구현 우선순위:**
1. 기본 업로드 기능
2. 그리드 표시 
3. 카테고리 분류
4. 편집 기능

#### 2.2 장비 컬렉션 (1주)
- [ ] 장비 등록 폼
- [ ] 장비 목록 표시
- [ ] 카테고리별 분류 (음향, 키보드, 기타)
- [ ] 상세 정보 모달
- [ ] 검색 및 필터링

**구현 우선순위:**
1. 기본 등록/조회
2. 카테고리 분류
3. 이미지 업로드
4. 검색 기능

#### 2.3 관심사 기록 (3-4일)
- [ ] 관심사 등록 및 편집
- [ ] 태그 기반 분류
- [ ] 메모 및 링크 첨부
- [ ] 타임라인 표시

---

### Phase 3: Tag Search Service 구현 (3-4주)
**목표**: 무한 계층 태그 시스템의 핵심 기능 구현

#### 3.1 태그 시스템 기반 구조 (1주)
- [ ] 태그 생성/편집/삭제 기능
- [ ] 무한 계층 구조 구현
- [ ] 부모-자식 관계 관리
- [ ] 태그 경로 자동 생성

#### 3.2 태그 네비게이션 UI (1-2주)
- [ ] Miller Columns 구현
- [ ] Breadcrumb 경로 표시
- [ ] 드릴다운 네비게이션
- [ ] 태그 검색 기능

**UI 패턴 선택:**
- **1단계**: Miller Columns (3단 컬럼)
- **2단계**: Tree View 옵션 추가
- **3단계**: 하이브리드 네비게이션

#### 3.3 콘텐츠 관리 (1주)
- [ ] 콘텐츠 등록 (링크, 텍스트, 파일)
- [ ] 다중 태그 할당
- [ ] 콘텐츠 검색 및 필터링
- [ ] 즐겨찾기 기능

#### 3.4 고급 검색 (3-4일)
- [ ] 태그 조합 검색 (AND/OR)
- [ ] 전문 검색 (제목, 내용)
- [ ] 검색 결과 하이라이트
- [ ] 검색 히스토리

---

### Phase 4: Career Profile 구현 (2주)
**목표**: 경력 정보 관리 및 임시 URL 시스템

#### 4.1 경력 정보 관리 (1주)
- [ ] 회사 정보 등록/편집
- [ ] 시간순 정렬 및 표시
- [ ] 업무 성과 기록
- [ ] 타임라인 시각화

#### 4.2 임시 URL 시스템 (1주)
- [ ] Short code 생성 시스템
- [ ] 링크 만료 관리
- [ ] 접근 로그 기록
- [ ] 관리자 대시보드

---

## 기술적 구현 전략

### 컴포넌트 구조
```
src/
├── components/
│   ├── common/           # 공통 컴포넌트
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   └── Modal/
│   ├── auth/            # 인증 관련
│   │   ├── LoginForm/
│   │   └── ProtectedRoute/
│   ├── personal/        # 개인 프로필
│   │   ├── PhotoGallery/
│   │   └── EquipmentList/
│   ├── career/          # 경력 프로필
│   │   └── CareerTimeline/
│   └── tags/            # 태그 검색
│       ├── TagTree/
│       ├── ContentList/
│       └── SearchBox/
├── hooks/               # 커스텀 훅
│   ├── useAuth.js
│   ├── useSupabase.js
│   └── useTags.js
├── services/            # API 서비스
│   ├── auth.service.js
│   ├── photo.service.js
│   ├── equipment.service.js
│   └── tag.service.js
└── utils/               # 유틸리티
    ├── supabase.js
    ├── validation.js
    └── constants.js
```

### 상태 관리 전략
- **Context API**: 인증 상태, 전역 설정
- **React Query**: 서버 상태 관리 및 캐싱
- **Local State**: 컴포넌트별 UI 상태

### 라우팅 구조
```javascript
// src/App.js 라우팅 업데이트
const routes = [
  { path: '/', component: Home },
  { path: '/personal', component: PersonalProfile },
  { path: '/personal/photos', component: PhotoGallery },
  { path: '/personal/equipment', component: EquipmentList },
  { path: '/career/:code?', component: CareerProfile },
  { path: '/tags', component: TagSearch },
  { path: '/admin', component: AdminDashboard, protected: true }
]
```

---

## 개발 가이드라인

### 코딩 컨벤션
1. **컴포넌트 네이밍**: PascalCase
2. **파일 구조**: 기능별 폴더 분리
3. **CSS**: CSS Modules 또는 Styled Components
4. **상태 관리**: 함수형 컴포넌트 + Hooks

### 테스트 전략
1. **단위 테스트**: 각 서비스 함수
2. **통합 테스트**: API 호출 및 인증
3. **E2E 테스트**: 주요 사용자 플로우

### 배포 자동화
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ master ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
```

---

## 다음 액션 아이템

### 즉시 시작 가능한 작업 (우선순위 높음)
1. **Supabase 연동 테스트**: 기존 프로젝트 토큰 설정
2. **기본 인증 컴포넌트**: 로그인/로그아웃 구현  
3. **레이아웃 컴포넌트**: Header 및 Navigation 업데이트

### 준비 작업 필요 (우선순위 중간)
1. **Google OAuth 앱 등록**: 클라이언트 ID 발급
2. **Supabase Storage 설정**: 이미지 버킷 생성
3. **도메인 설정**: profile.angeleyes.kr 연결 확인

### 추후 고려사항 (우선순위 낮음)
1. **성능 모니터링**: 사용량 추적 시스템
2. **SEO 최적화**: 메타 태그 및 구조화 데이터
3. **PWA 기능**: 오프라인 지원 및 설치 가능

어떤 작업부터 시작하시겠어요?