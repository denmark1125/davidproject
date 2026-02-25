
import { ResumeData } from './types';

export const DEFAULT_DATA: ResumeData = {
  personalInfo: {
    name: '薛仲鈞',
    englishName: 'David Xue',
    title: '品牌顧問 | 視覺設計師 | 行銷策略家',
    bio: '積極、開朗具有耐心、責任心強。樂於在旅途中體驗不同的文化，並將所見所聞轉化為充滿溫度的設計靈思與精準的市場策略。',
    email: 'denmark1125@gmail.com',
    location: '台灣，高雄市',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    instagramUrl: 'https://www.instagram.com/david_xue/',
    pdfUrl: ''
  },
  experiences: [
    {
      id: 'exp1',
      period: '2021.07 - 現在',
      company: '自由接案 Freelancer',
      role: '品牌與設計顧問',
      description: ['主導多項 CIS 視覺識別系統設計', '協助品牌進行社群行銷策略優化與網站體驗提升']
    },
    {
      id: 'exp2',
      period: '2019.12 - 2021.06',
      company: '扒飯米堡製飯所 PaFan Rice',
      role: '品牌創辦人 & 營運經理',
      description: ['結合台灣食材與沖繩風格，建立完整品牌標準', '兩個月內達成 22 萬次 Google 商家瀏覽紀錄']
    },
    {
      id: 'exp3',
      period: '2015.10 - 2019.04',
      company: '山華企業 Lightningcreek',
      role: '店長 & 行銷企劃',
      description: ['成功將傳統福利社轉型為獲利品牌門市', '年度業績成長達 120%，庫存去化率 90%']
    }
  ],
  skills: [
    {
      id: 's1',
      category: '數位行銷策略',
      items: ['品牌定位', 'GA4 數據分析', '社群經營', 'SEO 優化']
    },
    {
      id: 's2',
      category: '視覺設計美學',
      items: ['CIS 視覺識別', 'Photoshop', 'Illustrator', '商業攝影']
    },
    {
      id: 's3',
      category: '創新技術應用',
      items: ['No-code 開發', 'AI 生成應用', 'SaaS 系統規劃']
    }
  ],
  performance: [
    { id: 'p1', label: '活動營收成長', value: '120%' },
    { id: 'p2', label: '庫存清空率', value: '90%' },
    { id: 'p3', label: '網頁跳出率降低', value: '20%' },
    { id: 'p4', label: '社群流量提升', value: '30%' }
  ],
  portfolio: [
    {
      id: '1',
      title: '扒飯好食商行',
      category: 'CIS',
      description: '結合日本沖繩風格與台灣傳統美食意象，打造親切溫度的視覺識別。',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '2',
      title: '新木生技視覺規劃',
      category: 'CIS',
      description: '以綠色環保為核心，利用樹幹年輪設計傳達永續經營理念。',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '3',
      title: '澤物室內設計 SaaS',
      category: 'SaaS',
      description: '利用生成式 AI 邏輯，建構室內設計專用之專案管理系統。',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
    }
  ]
};
