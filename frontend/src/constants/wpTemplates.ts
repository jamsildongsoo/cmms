import type { WPCategoryTemplate } from '@/types/workPermit';

export const WP_TEMPLATES: Record<string, WPCategoryTemplate> = {
    // [별지 제1호/제7호 서식] 일반위험 및 화기작업 기반
    COM: {
        id: 'com',
        title: '일반 및 화기작업 안전 조치',
        questions: [
            { id: 'work_area_set', label: '작업구역 설정 및 출입경고 표지 설치', type: 'checkbox' }, // [cite: 2, 144]
            { id: 'fire_blanket', label: '비산불티 차단막(불꽃방지막) 설치', type: 'checkbox' }, // [cite: 2, 144]
            { id: 'gas_check_pre', label: '가스농도 측정 및 위험물질 방출/처리', type: 'checkbox' }, // [cite: 2]
            { id: 'loto_general', label: '정전/잠금/표지부착 (LOTO) 확인', type: 'checkbox' }, // [cite: 2]
            { id: 'ppe_edu', label: '안전장구 착용 및 안전교육 실시', type: 'checkbox' }, // [cite: 2, 144]
            { id: 'fire_ext_list', label: '소화기 비치 및 인화물질 제거 확인', type: 'checkbox' }, // [cite: 144]
            { id: 'op_presence', label: '운전요원의 입회 확인', type: 'checkbox' }, // [cite: 2, 144]
        ],
        colorClass: 'border-slate-200 bg-slate-50/10'
    },
    // [별지 제2호 서식] 밀폐공간 출입작업 기반
    CONF: {
        id: 'conf',
        title: '💨 밀폐 공간 작업 안전 조치',
        questions: [
            { id: 'gas_o2', label: '산소 (O2) % (기준: 18% 이상)', type: 'input', placeholder: '18% ~' }, // 
            { id: 'gas_co', label: '일산화탄소 (CO) ppm (기준: 25ppm 이하)', type: 'input', placeholder: '≤ 25ppm' }, // 
            { id: 'gas_h2s', label: '황화수소 (H2S) ppm (기준: 10ppm 이하)', type: 'input', placeholder: '≤ 10ppm' }, // 
            { id: 'gas_hc', label: '가연성가스 (H.C) % (기준: 0%)', type: 'input', placeholder: '0%' }, // 
            { id: 'gas_co2', label: '이산화탄소 (CO2) % (기준: 1.5% 미만)', type: 'input', placeholder: '< 1.5%' }, // 
            { id: 'vent_equip', label: '용기 세정 후 환기장비 가동 및 치환 확인', type: 'checkbox' }, // 
            { id: 'safety_gear_conf', label: '안전장구(구명선 등) 및 조명장비(방폭형) 확인', type: 'checkbox' }, // 
            { id: 'observer_conf', label: '감시인/운전요원 입회 및 통신수단 확보', type: 'checkbox' }, // 
        ],
        colorClass: 'border-blue-200 bg-blue-50/10'
    },
    // [별지 제3호 서식] 정전작업 기반
    ELEC: {
        id: 'elec',
        title: '⚡ 전기 작업 안전 조치',
        questions: [
            { id: 'main_sw_off', label: '주 차단 스위치 및 제어차단기 내림', type: 'checkbox' }, // [cite: 29, 32]
            { id: 'local_sw_off', label: '현장 스위치 내림 및 잠금장치 설치', type: 'checkbox' }, // [cite: 34, 35]
            { id: 'tag_out', label: '차단 표지판(Tag-out) 부착', type: 'checkbox' }, // [cite: 37]
            { id: 'discharge', label: '잔류전하 방전 및 충전여부(검전) 확인', type: 'checkbox' }, // [cite: 42, 44]
            { id: 'grounding_tool', label: '단락접지기구 설치 확인', type: 'checkbox' }, // [cite: 46]
            { id: 'comm_line', label: '작업자-운전자-전기담당자 간 통신수단 확보', type: 'checkbox' }, // [cite: 55]
        ],
        colorClass: 'border-yellow-200 bg-yellow-50/10'
    },
    // [별지 제4호 서식] 굴착작업 기반
    DIG: {
        id: 'dig',
        title: '🏗️ 굴착 작업 안전 조치',
        questions: [
            { id: 'pipe_check', label: '지하배관(기계/배관) 유무 확인', type: 'checkbox' }, // 
            { id: 'fire_pipe_check', label: '소방배관 및 배출구 유무 확인', type: 'checkbox' }, // 
            { id: 'power_cable_check', label: '전기동력선 유무 확인', type: 'checkbox' }, // 
            { id: 'control_cable_check', label: '제어용 케이블 유무 확인', type: 'checkbox' }, // 
            { id: 'etc_line_check', label: '기타(전화선, 접지선) 유무 확인', type: 'checkbox' }, // 
            { id: 'dig_sketch', label: '굴착도 스케치 및 위치 표시 첨부', type: 'checkbox' }, // 
        ],
        colorClass: 'border-amber-200 bg-amber-50/10'
    },
    // [별지 제5호 서식] 고소작업 기반
    HIGH: {
        id: 'high',
        title: '🧗 고소 작업 안전 조치',
        questions: [
            { id: 'scaffold_safety', label: '작업발판 및 안전난간 설치 상태', type: 'checkbox' }, // [cite: 83]
            { id: 'harness_helmet', label: '안전모 및 안전대(그네형) 착용/부착', type: 'checkbox' }, // [cite: 83]
            { id: 'safety_net_high', label: '추락 방지용 방망 설치 여부', type: 'checkbox' }, // [cite: 83]
            { id: 'opening_measure', label: '개구부 방호 조치 상태', type: 'checkbox' }, // [cite: 83]
        ],
        colorClass: 'border-green-200 bg-green-50/10'
    },
    // [별지 제6호 서식] 중량물 취급 기반
    HEAVY: {
        id: 'heavy',
        title: '🏗️ 중량물 취급/중장비 작업',
        questions: [
            { id: 'weather_cond', label: '기상상태(강풍 등) 확인', type: 'checkbox' }, // [cite: 103]
            { id: 'power_line_interf', label: '주변 전원설비 간섭 여부 확인', type: 'checkbox' }, // [cite: 105]
            { id: 'signal_man', label: '신호수 배치 및 통행금지 표지 부착', type: 'checkbox' }, // [cite: 107, 114]
            { id: 'outrigger_mat', label: '아웃트리거용 매트 등 부속장구 사용', type: 'checkbox' }, // [cite: 108]
            { id: 'ground_cond', label: '노면 상태 및 조명설비 확인', type: 'checkbox' }, // [cite: 110, 112]
            { id: 'plan_license', label: '작업계획서 작성 및 조종사 자격증 소지 확인', type: 'checkbox' }, // [cite: 115, 117]
        ],
        colorClass: 'border-purple-200 bg-purple-50/10'
    }
};