// Sample KPI data for testing
export const sampleKpis = [
  {
    name: "Doanh số bán hàng",
    description: "Tổng doanh số bán hàng trong tháng",
    departmentId: "sales", // Will be mapped to actual department ID
    unit: "VND",
    frequency: "monthly" as const,
    reward: 500000,
    penalty: 200000,
    category: "Doanh số",
    weight: 5
  },
  {
    name: "Số khách hàng mới",
    description: "Số lượng khách hàng mới được thu hút",
    departmentId: "sales",
    unit: "khách hàng",
    frequency: "monthly" as const,
    reward: 300000,
    penalty: 100000,
    category: "Khách hàng",
    weight: 4
  },
  {
    name: "Tỷ lệ hoàn thành dự án",
    description: "Tỷ lệ phần trăm dự án hoàn thành đúng hạn",
    departmentId: "development",
    unit: "%",
    frequency: "quarterly" as const,
    reward: 400000,
    penalty: 150000,
    category: "Hiệu suất",
    weight: 6
  },
  {
    name: "Số giờ làm việc",
    description: "Tổng số giờ làm việc trong tháng",
    departmentId: "hr",
    unit: "giờ",
    frequency: "monthly" as const,
    reward: 200000,
    penalty: 50000,
    category: "Thời gian",
    weight: 3
  },
  {
    name: "Đánh giá chất lượng sản phẩm",
    description: "Điểm đánh giá chất lượng sản phẩm từ khách hàng",
    departmentId: "quality",
    unit: "điểm",
    frequency: "monthly" as const,
    reward: 350000,
    penalty: 100000,
    category: "Chất lượng",
    weight: 5
  },
  {
    name: "Số cuộc gọi hỗ trợ",
    description: "Số lượng cuộc gọi hỗ trợ khách hàng hoàn thành",
    departmentId: "support",
    unit: "cuộc gọi",
    frequency: "weekly" as const,
    reward: 150000,
    penalty: 50000,
    category: "Hỗ trợ",
    weight: 3
  },
  {
    name: "Tỷ lệ phản hồi khách hàng",
    description: "Tỷ lệ phần trăm khách hàng phản hồi tích cực",
    departmentId: "customer-service",
    unit: "%",
    frequency: "monthly" as const,
    reward: 250000,
    penalty: 75000,
    category: "Hài lòng",
    weight: 4
  },
  {
    name: "Số bài viết content",
    description: "Số lượng bài viết content được tạo ra",
    departmentId: "marketing",
    unit: "bài viết",
    frequency: "monthly" as const,
    reward: 200000,
    penalty: 50000,
    category: "Content",
    weight: 3
  }
];

export const sampleDepartments = [
  {
    name: "Phòng Kinh doanh",
    description: "Phụ trách bán hàng và phát triển khách hàng"
  },
  {
    name: "Phòng Phát triển",
    description: "Phát triển sản phẩm và công nghệ"
  },
  {
    name: "Phòng Nhân sự",
    description: "Quản lý nhân sự và tuyển dụng"
  },
  {
    name: "Phòng Chất lượng",
    description: "Kiểm soát chất lượng sản phẩm"
  },
  {
    name: "Phòng Hỗ trợ",
    description: "Hỗ trợ khách hàng và kỹ thuật"
  },
  {
    name: "Phòng Marketing",
    description: "Marketing và truyền thông"
  }
];
