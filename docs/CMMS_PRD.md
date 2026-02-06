# **CMMS 개발 제품 요구사항 문서 (PRD)**

## **1\. 개요**

본 프로젝트는 설비 유지보수 프로세스를 디지털화하여 체계적으로 관리하고, 설비 가동률 극대화 및 유지보수 비용 절감을 목표로 하는 **컴퓨터화된 유지보수 관리 시스템(CMMS)** 개발을 목적으로 합니다.

## **2\. 주요 목표**

* **유지보수 프로세스 표준화:** 표준 절차 수립을 통한 인적 오류 최소화.  
* **자산 정보 통합:** 중앙 집중식 설비 및 부품 데이터 관리.  
* **예방 점검 체계화:** 주기적 점검 이력 데이터화를 통한 분석 지원.  
* **데이터 기반 의사결정:** 수리 이력 및 투입 비용 분석을 통한 재무 전략 수립.

  ## **3\. 핵심 기능 요구사항 (Functional Requirements)**

  ### **3.1 기준정보 관리**

* 다단계 부서 구조(Parent-Child) 및 플랜트/사이트 관리.  
* 사용자 및 역할 기반 권한 관리 (페이지별 CRUD 권한).  
* 공통 코드 관리 (헤더-아이템 구조).

  ### **3.2 설비 자산 관리**

* 설비 마스터 등록, 수정, 삭제 및 상태 관리.  
* 설비별 사양 정보 및 관련 문서(첨부파일) 연동.  
* 제조사, 재무 정보(상각법 등), 점검 주기 정보 관리.

  ### **3.3 유지보수 및 점검 (Inspection & WO)**

* **예방 정비(PM):** 주기 기반(일, 월, 분기 등) 계획 수립 및 차기 점검일 자동 계산.  
* **작업 지시(WO):** 긴급/정기 작업 생성, 배정, 상태 추적 및 결과 보고.  
* **작업 허가(WP):** 고위험 작업 시 안전/위험 요인 체크리스트 및 서명 관리.

  ### **3.4 부품 및 재고 관리**

* 부품 마스터 관리 및 3단계 위치 관리(창고-스토리지빈-로케이션).  
* 입/출고, 이동, 조정 이력 관리 및 월마감(Closing) 기능.  
* 최소/최대 재고 알림.

  ### **3.5 결재 및 공통**

* 문서별 결재 프로세스(결재, 합의, 통보) 연동.  
* 첨부파일 그룹 관리 및 일련번호(Sequence) 자동 생성.

  ## **4\. 기술 스택 (Technical Stack)**

| 분류 | 기술 | 비고 |
| ----- | ----- | ----- |
| **Frontend** | React, JavaScript, CSS | 반응형 UI/UX (Tailwind CSS 추천) |
| **Backend** | Spring Boot | Java 기반 안정적인 REST API 구현 |
| **Database** | PostgreSQL | 신뢰성 및 가성비 위주 데이터 저장 |
| **Infra** | Naver Cloud | 국내 클라우드 환경 활용 |
| **Mobile** | React Native | iOS/Android 크로스 플랫폼 지원 |

  ## **5\. 프로젝트 디렉토리 구조 (Proposed)**

cmms/

├── backend/ (Spring Boot)

│   ├── src/main/java/com/cmms/

│   │   ├── domain/ (Entities)

│   │   ├── repository/

│   │   ├── service/

│   │   ├── controller/ (API Endpoints)

│   │   └── common/ (Security, Config, Utils)

│   └── src/main/resources/

├── frontend/ (React)

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── hooks/

│   │   ├── services/ (API Calls)

│   │   └── store/ (State Management)

├── mobile/ (React Native)

└── docs/

    ├── CMMS\_PRD.md

    ├── CMMS\_TABLES.md

    └── CMMS\_UI.md

## **6\. 기술적 특이사항**

* **일련번호 규칙:**  
  * 설비: '1'로 시작하는 10자리  
  * 재고: '2'로 시작하는 10자리  
  * 점검: `IN-YYYYMM-NNNNN` (13자리) / 작업지시는 WO, 작업허가는 WP, 재고는 TX, 결재는 AP  
* **보안:** 역할 기반 접근 제어(RBAC), 비밀번호 해싱(BCrypt).  
* **데이터:** Soft Delete(`delete_mark`) 정책 적용.  
* 개발단계에서 supabase, render, github 활용함 

