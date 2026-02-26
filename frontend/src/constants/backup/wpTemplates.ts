import type { WPCategoryTemplate } from '@/types/workPermit';

export const WP_TEMPLATES: Record<string, WPCategoryTemplate> = {
    COM: {
        id: 'com',
        title: '공통 안전 점검 (필수)',
        questions: [
            { id: 'check_ppe', label: '1. 개인보호구(안전모, 안전화 등)를 착용하였는가?', type: 'checkbox' },
            { id: 'check_edu', label: '2. 작업 전 안전 교육(TBM)을 실시하였는가?', type: 'checkbox' },
            { id: 'check_ext', label: '3. 주변 소화기 비치 및 이상 유무를 확인하였는가?', type: 'checkbox' },
            { id: 'check_clean', label: '4. 작업 주변 정리정돈 상태가 양호한가?', type: 'checkbox' },
        ],
        colorClass: 'border-slate-200 bg-slate-50/10'
    },
    HOT: {
        id: 'hot',
        title: '🔥 화기 작업 안전 조치',
        questions: [
            { id: 'fire_watcher', label: '화재 감시자 (성명)', type: 'input', placeholder: '성명 입력' },
            { id: 'fire_extinguisher', label: '소화기 비치 확인', type: 'checkbox' },
            { id: 'welding_blanket', label: '불티 비산 방지포 설치 확인', type: 'checkbox' },
            { id: 'gas_check', label: '주변 인화성 물질 제거 확인', type: 'checkbox' },
        ],
        colorClass: 'border-red-200 bg-red-50/10'
    },
    CONF: {
        id: 'conf',
        title: '💨 밀폐 공간 작업 안전 조치',
        questions: [
            { id: 'gas_o2', label: '산소 (O2) %', type: 'input', placeholder: '18-23.5%' },
            { id: 'gas_co', label: '일산화탄소 (CO) ppm', type: 'input', placeholder: '< 30ppm' },
            { id: 'gas_h2s', label: '황화수소 (H2S) ppm', type: 'input', placeholder: '< 10ppm' },
            { id: 'gas_lel', label: '가연성가스 (LEL) %', type: 'input', placeholder: '< 25%' },
            { id: 'ventilation', label: '환기 설비 가동 및 적정 공기 확인', type: 'checkbox' },
            { id: 'observer', label: '감시인 배치 확인 (성명)', type: 'input', placeholder: '성명 입력' },
        ],
        colorClass: 'border-blue-200 bg-blue-50/10'
    },
    ELEC: {
        id: 'elec',
        title: '⚡ 전기 작업 안전 조치',
        questions: [
            { id: 'loto', label: 'LOTO(Lock-Out, Tag-Out) 실시 확인', type: 'checkbox' },
            { id: 'insulation', label: '절연 장구 착용 및 절연 매트 설치', type: 'checkbox' },
            { id: 'grounding', label: '접지 상태 확인', type: 'checkbox' },
            { id: 'voltage_tester', label: '검전기 휴대 및 전압 체크', type: 'checkbox' },
        ],
        colorClass: 'border-yellow-200 bg-yellow-50/10'
    },
    HIGH: {
        id: 'high',
        title: '🧗 고소 작업 안전 조치',
        questions: [
            { id: 'safety_belt', label: '안전대(그네형) 착용 및 체결 확인', type: 'checkbox' },
            { id: 'scaffold', label: '비계/작업발판 이상 유무 확인', type: 'checkbox' },
            { id: 'safety_net', label: '추락 방지망/생명줄 설치 확인', type: 'checkbox' },
            { id: 'helmet_chinstrap', label: '턱끈 체결 확인', type: 'checkbox' },
        ],
        colorClass: 'border-green-200 bg-green-50/10'
    },
    DIG: {
        id: 'dig',
        title: '🏗️ 굴착 작업 안전 조치',
        questions: [
            { id: 'underground_check', label: '지하 매설물 사전 확인', type: 'checkbox' },
            { id: 'slope_stability', label: '법면 경사도 및 붕괴 방지 조치', type: 'checkbox' },
            { id: 'heavy_equip_mgr', label: '장비 신호수 배치 (성명)', type: 'input', placeholder: '성명 입력' },
            { id: 'gas_detector', label: '가스 검지기 비치 (필요 시)', type: 'checkbox' },
        ],
        colorClass: 'border-amber-200 bg-amber-50/10'
    }
};
