# Personal Profile & Tag-Based Search Platform

## 프로젝트 개요
개인 프로필과 태그 기반 검색 서비스를 제공하는 웹 플랫폼

## 주요 기능 카테고리

### 1. 개인 프로필 (Personal Profile)
- **목적**: 개인적인 관심사, 소유 장비, 사진 등을 정리하는 공간
- **접근성**: 누구나 접근 가능
- **기능**:
  - 사진 갤러리 및 관리
  - 음향 기기, 키보드 등 개인 장비 정리
  - 개인적 취향 및 관심사 기록

### 2. Open 프로필 (Career Profile)
- **목적**: 회사 경력 및 업무 이력을 순차적으로 정리
- **접근성**: 관리자가 생성한 특정 URL을 통해서만 접근 가능
- **URL 구조**: `profile.angeleyes.kr/profile/{6자리-short-code}`
- **만료 시스템**: 관리자 설정 만료일 이후 접근 차단
- **기능**:
  - 시간순 회사 이력 정리
  - 각 회사에서 수행한 업무 상세 기록
  - 경력 기반 개인 역량 및 성향 소개
  - 접근 로그 및 통계 기능

### 3. 태그 기반 검색 서비스 (Tag-Based Search Service)
- **목적**: 무한 계층 태그를 활용한 데이터 저장 및 검색 시스템
- **접근성**: 향후 다중 사용자 확장 예정
- **태그 구조**: 
  - 무한 depth 계층형 구조 (예: 개발 → C# → Web → ASP.NET → API)
  - 단계별 drill-down 네비게이션
  - Breadcrumb 경로 표시
- **기능**:
  - 계층별 순차 선택을 통한 정확한 검색
  - 태그 트리 구조 시각화
  - 링크 및 콘텐츠 저장 관리

## 기술 스택

### Frontend
- **프레임워크**: React
- **배포**: GitHub Pages
- **호스팅**: 기존 도메인 `profile.angeleyes.kr` 활용

### Backend & Database
- **데이터베이스**: Supabase (기존 프로젝트 활용)
- **인증**: Google OAuth 우선, Microsoft/GitHub 차순위
- **보안**: RLS (Row Level Security) 적용 필수
- **연결**: MCP Supabase 액세스 토큰 설정 필요

### 개발 환경
- **플랫폼**: Windows 기반 개발
- **쉘**: PowerShell 우선 사용
- **언어**: 한국어 기본 소통

## 보안 요구사항

### 데이터베이스 보안
- Supabase RLS 정책 반드시 적용
- 인증된 사용자만 개인 데이터 접근 가능
- Open 프로필은 특정 URL 기반 접근 제어

### 인증 시스템
- OAuth 2.0 / OpenID Connect 표준 준수
- GitHub 로그인 우선 고려 (GitHub Pages 연동성)
- 대체 옵션: Google, Microsoft 로그인

## 관리 기능
모든 카테고리는 관리자 페이지를 통한 CRUD 기능 제공:
- 개인 프로필 항목 관리
- 회사 이력 및 업무 내용 관리  
- 태그 및 검색 데이터 관리

## 개발 우선순위

### Phase 1: 기본 구조 설정
1. React 프로젝트 초기 설정
2. Supabase 연동 및 기본 스키마 설계
3. 기본 인증 시스템 구현

### Phase 2: 핵심 기능 구현
1. 개인 프로필 페이지 개발
2. 태그 기반 검색 시스템 구현
3. Open 프로필 및 접근 제어 시스템

### Phase 3: 관리 및 확장
1. 관리자 페이지 개발
2. 다중 사용자 지원 확장
3. 성능 최적화 및 추가 기능

## 중요 확인 사항

### 확정된 사항
- [x] **Supabase 프로젝트**: 기존 프로젝트 활용 (토큰 설정 필요)
- [x] **인증 제공자**: Google 우선, Microsoft/GitHub 차순위  
- [x] **태그 시스템**: 무한 계층 구조 (개발→C#→Web→ASP.NET)
- [x] **Open 프로필 URL**: `profile.angeleyes.kr/profile/{short-code}` + 만료일 설정

### 추가 논의 필요 사항
- [ ] **태그 계층 UI**: Miller Columns vs Tree View vs Breadcrumb 네비게이션
- [ ] **데이터 스키마**: 각 카테고리별 저장 데이터 구조 상세 설계
- [ ] **관리자 권한**: 태그 생성/수정/삭제 권한 범위
- [ ] **사용자 확장**: 다중 사용자 시 태그 공유/개인 정책

### 시스템 날짜 기반 기본값
- 프로젝트 생성일: 현재 시스템 날짜 기준 (2025-08-27)
- 모든 날짜 관련 기본값: 시스템 날짜 자동 참조

### Windows 개발 환경 고려사항
- PowerShell 명령어 우선 사용
- 경로 구분자 백슬래시 고려
- Windows 파일 시스템 제약사항 준수

## 데이터베이스 스키마 설계

### 무한 계층 태그 시스템
```sql
-- 태그 계층 구조 테이블
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES tags(id),
  depth INTEGER DEFAULT 0,
  path TEXT, -- 전체 경로: "개발/C#/Web"
  created_at TIMESTAMP DEFAULT NOW()
);

-- 태그와 콘텐츠 연결 테이블
CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  tag_id UUID REFERENCES tags(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Open 프로필 링크 관리
```sql
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
```

## 다음 단계
1. Supabase 액세스 토큰 설정
2. React 프로젝트 초기 설정 및 의존성 설치
3. 기본 스키마 생성 및 RLS 정책 적용
4. Google OAuth 인증 시스템 구현