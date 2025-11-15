type BlockTemplateData = Record<string, unknown>;

export const BLOCK_DEFAULT_DATA: Record<string, BlockTemplateData> = {
  "hero":     {
          titleLines: ["TẠO RA.", "THU HÚT.", "CHUYỂN ĐỔI."],
          subtitle: "CHUYÊN GIA HÌNH ẢNH 3D...",
          brandLogos: [{ url: "/images/brands/brand-1.png", alt: "Brand 1" }],
          videoUrl: "/hero-glass-video.mp4",
          posterUrl: "/hero-glass.jpg",
          ctas: [
            { label: "Xem thêm", url: "#services" },
            { label: "Tư vấn", url: "#contact" },
          ],
        },
  "services": {
    title: "Dịch vụ",
    subtitle: "Những gì chúng tôi làm",
    items: [
      {
        icon: "Film",
        title: "SẢN XUẤT PHIM HOẠT HÌNH 2D/3D",
        description: "Chúng tôi chuyên làm phim hoạt hình 3D từ khâu lên ý tưởng, kịch bản, thiết kế đến những cảnh chuyển sáng tạo và hấp dẫn qua từng thước hình. Với kỹ thuật animation tinh xảo, chúng tôi giúp bạn kể những câu chuyện độc nhất theo cách sinh động nhất.",
        image: "https://stepv.studio/wp-content/uploads/2025/03/jomalonewithouttext-min-819x1024.png",
        linkUrl: "/projects"
      },
      {
        icon: "Box",
        title: "MÔ PHỎNG 3D VÀ ANIMATION",
        description: "Dịch vụ mô phỏng 3D cho phép bạn tạo ra những hình ảnh sống động và chân thực, thể hiện mô phỏng cơ khí, nội thất, hoặc các vật thể phức tạp. Đặc biệt hữu ích đối với doanh nghiệp muốn giới thiệu sản phẩm cuối cùng. Chúng tôi cung cấp animation 3D cho các dự án quảng cáo hoặc giới thiệu sản phẩm.",
        image: "https://stepv.studio/wp-content/uploads/2025/03/BOIS-1-1024x576.png",
        linkUrl: "/projects"
      },
      {
        icon: "Sparkles",
        title: "HIỆU ỨNG HÌNH ẢNH VFX",
        description: "Chúng tôi cung cấp các hiệu ứng hình ảnh (VFX) cao cấp cho các bộ phim hoặc quảng cáo, giúp nâng cao chất lượng hình ảnh và tạo ra những cảnh quay ấn tượng. Đội ngũ chuyên nghiệp, biến hóa hay cảnh quay siêu thực, đội ngũ VFX của chúng tôi luôn mang đến kết quả tuyệt vời.",
        image: "https://stepv.studio/wp-content/uploads/2025/03/BOIS-VFX-2-576x1024.png",
        linkUrl: "/projects"
      },
      {
        icon: "Megaphone",
        title: "MARKETING 3D SÁNG TẠO",
        description: "Dịch vụ Marketing 3D sáng tạo kết hợp mô hình 3D với các chiến lược quảng cáo, phương pháp tiếp cận hoàn toàn mới mẻ và hấp dẫn cho các chiến dịch marketing. Thay vì chỉ sử dụng hình ảnh thông thường, bạn có thể sử dụng mô hình 3D để mô phỏng sức mạnh và sự tương tác với khách hàng, giúp bạn tạo ra tính thẩm mỹ và cảm giác sống động cho người xem.",
        image: "https://stepv.studio/wp-content/uploads/2025/01/2321-680x1024.png",
        linkUrl: "/projects"
      },
      {
        icon: "Code",
        title: "THIẾT KẾ WEB 2D/3D",
        description: "Dịch vụ thiết kế web 2D/3D giúp bạn có một website độc đáo và sáng tạo, mang lại trải nghiệm người dùng tuyệt vời. Chúng tôi tạo ra các website tương tác, với thiết kế 2D hoặc 3D theo yêu cầu, tùy chỉnh và tối ưu hóa SEO. Đảm bảo website của bạn không chỉ đẹp mà còn dễ dàng sử dụng, giúp khách hàng dễ dàng tiếp cận và chuyển đổi.",
        image: "https://stepv.studio/wp-content/uploads/2024/08/vlcsnap-2024-08-24-20h27m01s097-576x1024.png",
        linkUrl: "/projects"
      },
      {
        icon: "Bot",
        title: "VIDEO MARKETING AI",
        description: "Chúng tôi cung cấp dịch vụ video marketing AI, giúp tạo ra các video quảng cáo tự động với nội dung được cá nhân hóa trên dữ liệu và phân tích thị trường. Sử dụng công nghệ AI, chúng tôi có thể tối ưu hóa video của bạn để phù hợp với từng đối tượng khách hàng, tạo ra các video quảng cáo hiệu quả hơn và dễ dàng thu hút người xem.",
        image: "https://stepv.studio/wp-content/uploads/2025/01/pexels-pixabay-164938-1024x620.jpg",
        linkUrl: "/projects"
      }
    ],
  },
  "stats": {
    backgroundColor: "bg-gray-900",
    items: [
      { number: "5+", label: "Years of Experience", delay: 100 },
      { number: "100+", label: "Completed Projects", delay: 200 },
      { number: "50+", label: "Supporters Worldwide", delay: 300 },
      { number: "1000+", label: "Visuals Rendered", delay: 400 }
    ],
  },
  "gallery":     {
          images: [{ url: "/images/sample.jpg", alt: "Mẫu" }],
        },
  "whyChooseUs": {
    title: "TẠI SAO CÁC THƯƠNG HIỆU TIN TƯỞNG DOHY MEDIA",
    subtitle: "Chúng tôi chuyên tạo ra hình ảnh 3D siêu thực và hoạt hình được thiết kế riêng cho ngành nước hoa và làm đẹp. Chuyên môn của chúng tôi giúp các thương hiệu cao cấp thu hút khán giả, nâng cao cách trình bày sản phẩm và nổi bật trong thị trường cạnh tranh.",
    videoUrl: "",
    videoAlt: "",
    items: [
      {
        icon: "Gem",
        title: "CHUYÊN MÔN CAO CẤP",
        description: "Chúng tôi tập trung vào nước hoa và làm đẹp, đảm bảo mọi chi tiết phản ánh sự tinh tế của thương hiệu bạn."
      },
      {
        icon: "Cog",
        title: "GIẢI PHÁP TÙY CHỈNH",
        description: "Mọi dự án được tùy chỉnh theo bản sắc riêng của bạn để hình ảnh của bạn nổi bật trong thị trường đông đúc."
      },
      {
        icon: "Award",
        title: "CHẤT LƯỢNG ĐƯỢC CHỨNG MINH",
        description: "Portfolio của chúng tôi bao gồm các tác phẩm cho những thương hiệu cao cấp, chứng minh khả năng mang lại kết quả đẳng cấp."
      }
    ],
  },
  "why3DVisuals":     {
          title: "TẠI SAO HÌNH ẢNH 3D LÀ LỰA CHỌN THÔNG MINH CHO THƯƠNG HIỆU CỦA BẠN",
          subtitle: "",
          buttonText: "LIÊN HỆ CHÚNG TÔI",
          buttonLink: "#contact",
          topCards: [
            {
              icon: "DollarSign",
              title: "HIỆU QUẢ CHI PHÍ",
              items: [
                {
                  title: "Tiết Kiệm Chi Phí Sản Xuất",
                  content: "Không cần chụp ảnh đắt tiền, tạo mẫu thử hay thiết lập vật lý - hình ảnh 3D của chúng tôi mang lại kết quả cao cấp với chi phí chỉ bằng một phần nhỏ.",
                },
                {
                  title: "Tài Sản Có Thể Tái Sử Dụng",
                  content: "Hình ảnh 3D của bạn có thể được sử dụng lại cho nhiều chiến dịch, tiết kiệm thời gian và ngân sách cho các dự án tương lai.",
                },
                {
                  title: "Tính Bền Vững",
                  content: "Giảm lãng phí và tác động môi trường bằng cách loại bỏ nhu cầu sử dụng vật liệu vật lý.",
                },
              ],
            },
            {
              icon: "Video",
              title: "CHẤT LƯỢNG STUDIO ĐIỆN ẢNH",
              items: [
                {
                  title: "Hoàn Hảo Siêu Thực",
                  content: "Công nghệ kết xuất tiên tiến tái tạo hình ảnh không thể phân biệt với nhiếp ảnh thực tế.",
                },
                {
                  title: "Tự Do Sáng Tạo Vô Hạn",
                  content: "Không bị giới hạn bởi vật lý - tạo ra những góc nhìn, hiệu ứng ánh sáng và môi trường không thể thực hiện trong thực tế.",
                },
                {
                  title: "Tính Linh Hoạt Trên Nhiều Nền Tảng",
                  content: "Tối ưu hóa cho web, in ấn, video và thực tế ảo từ cùng một tài sản 3D.",
                },
              ],
            },
            {
              icon: "Clock3",
              title: "TỐC ĐỘ VÀ LINH HOẠT",
              items: [
                {
                  title: "Thời Gian Ra Thị Trường Nhanh Hơn",
                  content: "Bỏ qua các khâu logistics phức tạp của chụp ảnh truyền thống và nhận sản phẩm hoàn thiện trong vài ngày.",
                },
                {
                  title: "Chỉnh Sửa Dễ Dàng",
                  content: "Thực hiện thay đổi nhanh chóng với màu sắc, vật liệu hoặc thiết kế mà không cần chụp lại.",
                },
              ],
            },
          ],
          bottomCards: [
            {
              icon: "Gem",
              title: "ĐƯỢC THIẾT KẾ CHO HÀNG CAO CẤP",
              items: [
                {
                  title: "Tập Trung Độc Quyền Vào Nước Hoa & Làm Đẹp",
                  content: "Mỗi dự án được thiết kế để phản ánh sự tinh tế và sang trọng của thương hiệu bạn.",
                },
                {
                  title: "Quy Trình Hợp Tác",
                  content: "Làm việc chặt chẽ với đội ngũ của chúng tôi để đảm bảo tầm nhìn của bạn được hiện thực hóa chính xác như mong đợi.",
                },
              ],
            },
            {
              icon: "Lightbulb",
              title: "GIẢI PHÁP HƯỚNG TƯƠNG LAI",
              items: [
                {
                  title: "Tài Sản Có Thể Mở Rộng",
                  content: "Hình ảnh 3D phát triển cùng thương hiệu của bạn, cho phép cập nhật và điều chỉnh khi dòng sản phẩm mở rộng.",
                },
                {
                  title: "Công Nghệ Tiên Tiến",
                  content: "Luôn dẫn đầu xu hướng với hình ảnh được tạo bằng các kỹ thuật kết xuất 3D mới nhất.",
                },
              ],
            },
          ],
        },
  "turning":     {
          title: "BIẾN ĐAM MÊ THÀNH HOÀN HẢO",
          description:
            "Tại DOHY Media, mỗi thứ chúng tôi tạo ra đều bắt đầu từ niềm đam mê kể chuyện và đổi mới. Được thành lập tại Stuttgart, Đức, studio của chúng tôi ra đời từ mong muốn biến những ý tưởng táo bạo thành hình ảnh 3D và hoạt hình tuyệt đẹp. Những gì bắt đầu như một giấc mơ vượt qua ranh giới của thiết kế 3D đã phát triển thành đối tác sáng tạo đáng tin cậy cho các thương hiệu cao cấp và những người có tầm nhìn trên toàn thế giới. Mỗi dự án chúng tôi thực hiện đều là một sự hợp tác-tầm nhìn của bạn, được hiện thực hóa thông qua chuyên môn của chúng tôi.",
          buttonText: "LIÊN HỆ",
          buttonUrl: "#contact",
          backgroundColor: "bg-black",
          textSize: "text-[60.8px]",
          signatureImage: "https://stepv.studio/wp-content/uploads/2025/04/signaturewhite.png",
          founderName: "VASILII GUREV",
          founderTitle: "CEO & FOUNDER OF STEP V STUDIO",
          clientLogos: [
            { image: "https://stepv.studio/wp-content/uploads/2025/04/wn-x.png", alt: "WN-X Logo", client_name: "WN-X" },
            { image: "https://stepv.studio/wp-content/uploads/2025/04/dna.png", alt: "DNA Logo", client_name: "DNA" },
            { image: "https://stepv.studio/wp-content/uploads/2025/04/gdivine.png", alt: "G'DIVINE Logo", client_name: "G'DIVINE" },
            { image: "https://stepv.studio/wp-content/uploads/2025/04/hyaluronce.png", alt: "Hyaluronce Logo", client_name: "HYALURONCE" },
            { image: "https://stepv.studio/wp-content/uploads/2025/04/fivo.png", alt: "FIVO Logo", client_name: "FIVO" },
            { image: "https://stepv.studio/wp-content/uploads/2025/04/thedarkages.png", alt: "The Dark Ages Logo", client_name: "THE DARK AGES" },
            { image: "https://stepv.studio/wp-content/uploads/2025/04/gazzaz.png", alt: "GAZZAZ Logo", client_name: "GAZZAZ" },
            { image: "https://stepv.studio/wp-content/uploads/2025/04/sdvstudios.png", alt: "SDV Studios Logo", client_name: "SDV STUDIOS" },
            { image: "https://stepv.studio/wp-content/uploads/2025/04/caronparis.png", alt: "CARON PARIS Logo", client_name: "CARON PARIS" }
          ],
        },
  "weWork": {
    title: "CÁCH CHÚNG TÔI LÀM VIỆC",
    subtitle: "Tại Step V Studio, chúng tôi tin rằng kết quả tuyệt vời đến từ quy trình làm việc có cấu trúc và minh bạch.",
    ctas: [
      { label: "Bắt đầu dự án", url: "#contact" }
    ],
    items: [
      {
        icon: "Lightbulb",
        title: "KHỞI ĐỘNG & LÊN KẾ HOẠCH",
        description: "Buổi tư vấn miễn phí để hiểu rõ tầm nhìn, mục tiêu và yêu cầu của bạn. Mọi dự án bắt đầu với lộ trình rõ ràng."
      },
      {
        icon: "PenTool",
        title: "PHÁT TRIỂN Ý TƯỞNG",
        description: "Đội ngũ sáng tạo phát triển các ý tưởng mới và trình bày những phương án phù hợp với thương hiệu và mục tiêu dự án."
      },
      {
        icon: "Box",
        title: "MÔ HÌNH HÓA & THIẾT KẾ",
        description: "Sử dụng công cụ tiên tiến để tạo mô hình 3D chi tiết, kết cấu và ánh sáng để biến ý tưởng thành hiện thực."
      },
      {
        icon: "PlayCircle",
        title: "HOẠT HÌNH & HIỆU ỨNG",
        description: "Thêm hoạt hình động, hiệu ứng hình ảnh và điều chỉnh chuyển động để tạo ra nội dung hấp dẫn và cuốn hút."
      },
      {
        icon: "Search",
        title: "ĐÁNH GIÁ & HOÀN THIỆN",
        description: "Làm việc chặt chẽ với bạn để đánh giá tiến độ, thu thập phản hồi và thực hiện điều chỉnh cần thiết."
      },
      {
        icon: "CheckCircle2",
        title: "BÀN GIAO CUỐI CÙNG",
        description: "Sản phẩm hoàn thiện chất lượng cao được bàn giao theo định dạng bạn yêu cầu, sẵn sàng sử dụng."
      }
    ],
  },
  "stayControl":     {
          title: "KIỂM SOÁT HOÀN TOÀN VỚI BẢNG ĐIỀU KHIỂN KHÁCH HÀNG",
          subtitle: "Chúng tôi đã giúp bạn dễ dàng kết nối và kiểm soát mọi thứ!",
          items: [
            {
              title: "Truy cập tất cả file của bạn",
              description: "Tải xuống file dự án, sản phẩm bàn giao và phiên bản chỉnh sửa bất cứ lúc nào trong một nơi bảo mật.",
            },
            {
              title: "Theo dõi tiến độ dự án",
              description: "Cập nhật thời gian thực về tiến độ, cột mốc và deadline để bạn luôn nắm được tình hình.",
            },
            {
              title: "Giao tiếp dễ dàng",
              description: "Gửi phản hồi, đặt câu hỏi trực tiếp trong dashboard — không còn chuỗi email rườm rà.",
            },
            {
              title: "Tổ chức tốt cho dự án tương lai",
              description: "Kho lưu trữ dài hạn giúp xem lại dự án cũ hoặc bắt đầu dự án mới mà không mất thông tin.",
            },
          ],
        },
  "contactForm":     {
          title: "CÙNG HIỆN THỰC HÓA TẦM NHÌN CỦA BẠN",
          subtitle: "Chúng tôi ở đây để giúp bạn tạo ra những hình ảnh và hoạt hình tuyệt đẹp, thu hút khán giả và nâng tầm thương hiệu của bạn. Dù bạn có câu hỏi, cần báo giá, hay muốn thảo luận về dự án tiếp theo, chúng tôi rất mong được lắng nghe từ bạn.",
          socialIntro: "Theo dõi chúng tôi trên mạng xã hội để cập nhật tin tức mới nhất, dự án và nội dung hậu trường",
          cta: {
            label: "DỊCH VỤ CỦA CHÚNG TÔI",
            url: "#services"
          },
          contactTitle: "CÁCH LIÊN HỆ VỚI CHÚNG TÔI",
          contactDescription: "Hoặc gửi tin nhắn cho chúng tôi. Điền vào biểu mẫu bên dưới, chúng tôi sẽ phản hồi bạn trong vòng 24 giờ.",
          contactLinks: [
            { label: "Email", value: "contact@stepv.studio", href: "mailto:contact@stepv.studio" },
            { label: "Phone", value: "+49-176-21129718", href: "tel:+4917621129718" }
          ],
          formTitle: "Gửi tin nhắn",
          formDescription: "Điền thông tin để chúng tôi có thể tư vấn nhanh nhất.",
          fields: [
            { name: "name", label: "Họ và tên*", type: "text", placeholder: "Tên của bạn", required: true },
            { name: "email", label: "E-Mail*", type: "email", placeholder: "name@example.com", required: true },
            { name: "service", label: "Danh mục dịch vụ", type: "select", placeholder: "Chọn dịch vụ", required: false, options: [
              { label: "3D Product Animation", value: "product-animation" },
              { label: "3D Still Image", value: "still-image" },
              { label: "Consulting", value: "consulting" }
            ] },
            { name: "message", label: "Tin nhắn", type: "textarea", placeholder: "Bạn muốn chúng tôi hỗ trợ điều gì?", required: false }
          ],
          privacyText: "Tôi đồng ý với CHÍNH SÁCH BẢO MẬT",
          submitLabel: "GỬI",
          promiseHighlight: "Chúng tôi sẽ phản hồi trong 24 giờ làm việc.",
          socialLinks: [
            { platform: "YouTube", url: "https://www.youtube.com/@stepv", icon: "Youtube" },
            { platform: "Facebook", url: "https://www.facebook.com/stepvstudio", icon: "Facebook" },
            { platform: "Instagram", url: "https://www.instagram.com/stepvstudio", icon: "Instagram" },
            { platform: "TikTok", url: "https://www.tiktok.com/@stepvstudio", icon: "Tiktok" },
            { platform: "Pinterest", url: "https://www.pinterest.com/stepvstudio", icon: "Pinterest" },
            { platform: "Telegram", url: "https://t.me/stepvstudio", icon: "Telegram" },
            { platform: "X", url: "https://x.com/stepvstudio", icon: "X" },
            { platform: "Zalo", url: "https://zalo.me/stepvstudio", icon: "Zalo" }
          ]
        },
  "siteHeader":     {
          logo: "/images/logo-gold.png",
          backgroundImage: "/images/header-bg.jpg",
          menuItems: [
            { label: "TRANG CHU", url: "/", highlight: true },
            { label: "KHOA HOC", url: "/courses" },
            { label: "DU AN", url: "/projects" },
            { label: "VE CHUNG TOI", url: "/about" },
            { label: "THU VIEN", url: "/library" },
            { label: "THEM", url: "/more" }
          ],
          socials: [
            { platform: "YouTube", url: "https://www.youtube.com/@stepv", icon: "Youtube" },
            { platform: "Facebook", url: "https://www.facebook.com/stepvstudio", icon: "Facebook" },
            { platform: "Instagram", url: "https://www.instagram.com/stepvstudio", icon: "Instagram" },
            { platform: "TikTok", url: "https://www.tiktok.com/@stepvstudio", icon: "Tiktok" },
            { platform: "Pinterest", url: "https://www.pinterest.com/stepvstudio", icon: "Pinterest" },
            { platform: "Telegram", url: "https://t.me/stepvstudio", icon: "Telegram" },
            { platform: "X", url: "https://x.com/stepvstudio", icon: "X" },
            { platform: "Zalo", url: "https://zalo.me/stepvstudio", icon: "Zalo" }
          ],
          cta: { label: "LIÊN HỆ", url: "#contact" }
        },
  "careSection":     {},
  "siteFooter":     {
          logo: "/images/logo-gold.png",
          columns: [
            {
              title: "STUDIO CỦA CHÚNG TÔI",
              links: [
                { label: "Trang chủ", url: "/", highlight: true },
                { label: "Giới thiệu", url: "/about" },
                { label: "Dịch vụ", url: "/services" },
                { label: "Tuyển dụng", url: "/careers" }
              ]
            },
            {
              title: "DICH VU CUA CHUNG TOI",
              links: [
                { label: "Marketing", url: "/services/marketing" },
                { label: "Hình ảnh kiến trúc", url: "/services/architecture" },
                { label: "Hình ảnh sản phẩm", url: "/services/product" },
                { label: "Hoạt hình 3D", url: "/services/animation" }
              ]
            },
            {
              title: "ĐIỀU KHOẢN CHUNG",
              links: [
                { label: "Điều khoản sử dụng", url: "/terms" },
                { label: "Chính sách bảo mật", url: "/privacy" }
              ]
            }
          ],
          socialTitle: "THEO DÕI CHÚNG TÔI",
          socialLinks: [
            { platform: "YouTube", url: "https://www.youtube.com/@stepv", icon: "Youtube" },
            { platform: "Facebook", url: "https://www.facebook.com/stepvstudio", icon: "Facebook" },
            { platform: "Instagram", url: "https://www.instagram.com/stepvstudio", icon: "Instagram" },
            { platform: "TikTok", url: "https://www.tiktok.com/@stepvstudio", icon: "Tiktok" },
            { platform: "Pinterest", url: "https://www.pinterest.com/stepvstudio", icon: "Pinterest" },
            { platform: "Telegram", url: "https://t.me/stepvstudio", icon: "Telegram" },
            { platform: "X", url: "https://x.com/stepvstudio", icon: "X" },
            { platform: "Zalo", url: "https://zalo.me/stepvstudio", icon: "Zalo" }
          ],
          locationTitle: "TRỤ SỞ TẠI",
          locationLines: ["Stuttgart, Đức", "+49-176-21129718"],
          contactTitle: "LIÊN HỆ",
          contactEmail: "contact@stepv.studio",
          copyright: "© Bản quyền 2025 - Step V Studio. Tất cả quyền được bảo lưu"
        },
  "wordSlider":     {
          words: ["Tu khoa 1", "Tu khoa 2"]
        },
  "yourAdvice":     {
          title: "QUẢNG CÁO CỦA BẠN CÓ THỂ TRÔNG NHƯ THẾ NÀY",
          subtitle:
            "Khám phá cách chúng tôi đã giúp các thương hiệu cao cấp và ngành công nghiệp sáng tạo biến tầm nhìn của họ thành hiện thực với những hình ảnh 3D tuyệt đẹp và được thiết kế riêng.",
          buttons: [
            { text: "KHÁM PHÁ THÊM DỰ ÁN", url: "/projects", style: "primary" },
            { text: "LIÊN HỆ CHÚNG TÔI", url: "#contact", style: "secondary" },
          ],
          videos: [
            { videoId: "EZwwRmLAg90", title: "Oro Bianco | BOIS 1920 | Step V Studio | 3D Animation", linkUrl: "/projects" },
            { videoId: "M7lc1UVf-VE", title: "3D Product Animation - Perfume Bottle", linkUrl: "/projects" },
          ],
          mobileHeight: 400,
          content: "",
        },
} as const;
