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
    title: "Dich vu",
    subtitle: "Nhung gi chung toi lam",
    items: [
      {
        icon: "Film",
        title: "SAN XUAT PHIM HOAT HINH 2D/3D",
        description: "Chung toi chuyen lam phim hoat hinh 3D tu khau len y tuong, kich ban, thiet ke den nhung canh chuyen sang tao va hap dan qua tung thuoc hinh. Voi ky thuat animation tinh xao, chung toi giup ban ke nhung cau chuyen doc nhat theo cach sinh dong nhat.",
        image: "https://stepv.studio/wp-content/uploads/2025/03/jomalonewithouttext-min-819x1024.png",
        linkUrl: "/projects"
      },
      {
        icon: "Box",
        title: "MO PHONG 3D VA ANIMATION",
        description: "Dich vu mo phong 3D cho phep ban tao ra nhung hinh anh song dong va chan thuc, the hien mo phong co khi, noi that, hoac cac vat the phuc tap. Dac biet huu ich doi voi doanh nghiep muon gioi thieu san pham cuoi cung. Chung toi cung cap animation 3D cho cac du an quang cao hoac gioi thieu san pham.",
        image: "https://stepv.studio/wp-content/uploads/2025/03/BOIS-1-1024x576.png",
        linkUrl: "/projects"
      },
      {
        icon: "Sparkles",
        title: "HIEU UNG HINH ANH VFX",
        description: "Chung toi cung cap cac hieu ung hinh anh (VFX) cao cap cho cac bo phim hoac quang cao, giup nang cao chat luong hinh anh va tao ra nhung canh quay an tuong. Doi ngu chuyen nghiep, bien hoa hay canh quay sieu thuc, doi ngu VFX cua chung toi luon mang den ket qua tuyet voi.",
        image: "https://stepv.studio/wp-content/uploads/2025/03/BOIS-VFX-2-576x1024.png",
        linkUrl: "/projects"
      },
      {
        icon: "Megaphone",
        title: "MARKETING 3D SANG TAO",
        description: "Dich vu Marketing 3D sang tao ket hop mo hinh 3D voi cac chien luoc quang cao, phuong phap tiep can hoan toan moi me va hap dan cho cac chien dich marketing. Thay vi chi su dung hinh anh thong thuong, ban co the su dung mo hinh 3D de mo phong suc manh va su tuong tac voi khach hang, giup ban tao ra tinh the va cam giac song dong cho nguoi xem.",
        image: "https://stepv.studio/wp-content/uploads/2025/01/2321-680x1024.png",
        linkUrl: "/projects"
      },
      {
        icon: "Code",
        title: "THIET KE WEB 2D/3D",
        description: "Dich vu thiet ke web 2D/3D giup ban co mot website doc dao va sang tao, mang lai trai nghiem nguoi dung tuyet voi. Chung toi tao ra cac website tuong tac, voi thiet ke 2D hoac 3D theo yeu cau, tuy chinh va toi uu hoa SEO. Dam bao website cua ban khong chi dep ma con de dang su dung, giup khach hang de dang tiep can va chuyen doi.",
        image: "https://stepv.studio/wp-content/uploads/2024/08/vlcsnap-2024-08-24-20h27m01s097-576x1024.png",
        linkUrl: "/projects"
      },
      {
        icon: "Bot",
        title: "VIDEO MARKETING AI",
        description: "Chung toi cung cap dich vu video marketing AI, giup tao ra cac video quang cao tu dong voi noi dung duoc ca nhan hoa tren du lieu va phan tich thi truong. Su dung cong nghe AI, chung toi co the toi uu hoa video cua ban de phu hop voi tung doi tuong khach hang, tao ra cac video quang cao hieu qua hon va de dang thu hut nguoi xem.",
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
    title: "TAI SAO CAC THUONG HIEU TIN TUONG DOHY MEDIA",
    subtitle: "Chung toi chuyen tao ra hinh anh 3D sieu thuc va hoat hinh duoc thiet ke rieng cho nganh nuoc hoa va lam dep. Chuyen mon cua chung toi giup cac thuong hieu cao cap thu hut khan gia, nang cao cach trinh bay san pham va noi bat trong thi truong canh tranh.",
    videoUrl: "",
    videoAlt: "",
    items: [
      {
        icon: "Gem",
        title: "CHUYEN MON CAO CAP",
        description: "Chung toi tap trung vao nuoc hoa va lam dep, dam bao moi chi tiet phan anh su tinh te cua thuong hieu ban."
      },
      {
        icon: "Cog",
        title: "GIAI PHAP TUY CHINH",
        description: "Moi du an duoc tuy chinh theo ban sac rieng cua ban de hinh anh cua ban noi bat trong thi truong dong duc."
      },
      {
        icon: "Award",
        title: "CHAT LUONG DUOC CHUNG MINH",
        description: "Portfolio cua chung toi bao gom cac tac pham cho nhung thuong hieu cao cap, chung minh kha nang mang lai ket qua dang cap."
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
    title: "CACH CHUNG TOI LAM VIEC",
    subtitle: "Tai Step V Studio, chung toi tin rang ket qua tuyet voi den tu quy trinh lam viec co cau truc va minh bach.",
    ctas: [
      { label: "Bat dau du an", url: "#contact" }
    ],
    items: [
      {
        icon: "Lightbulb",
        title: "KHOI DONG & LEN KE HOACH",
        description: "Buoi tu van mien phi de hieu ro tam nhin, muc tieu va yeu cau cua ban. Moi du an bat dau voi lo trinh ro rang."
      },
      {
        icon: "PenTool",
        title: "PHAT TRIEN Y TUONG",
        description: "Doi ngu sang tao phat trien cac y tuong moi va trinh bay nhung phuong an phu hop voi thuong hieu va muc tieu du an."
      },
      {
        icon: "Box",
        title: "MO HINH HOA & THIET KE",
        description: "Su dung cong cu tien tien de tao mo hinh 3D chi tiet, ket cau va anh sang de bien y tuong thanh hien thuc."
      },
      {
        icon: "PlayCircle",
        title: "HOAT HINH & HIEU UNG",
        description: "Them hoat hinh dong, hieu ung hinh anh va dieu chinh chuyen dong de tao ra noi dung hap dan va cuon hut."
      },
      {
        icon: "Search",
        title: "DANH GIA & HOAN THIEN",
        description: "Lam viec chat che voi ban de danh gia tien do, thu thap phan hoi va thuc hien dieu chinh can thiet."
      },
      {
        icon: "CheckCircle2",
        title: "BAN GIAO CUOI CUNG",
        description: "San pham hoan thien chat luong cao duoc ban giao theo dinh dang ban yeu cau, san sang su dung."
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
          title: "CUNG HIEN THUC HOA TAM NHIN CUA BAN",
          subtitle: "Chung toi o day de giup ban tao ra nhung hinh anh va hoat hinh tuyet dep, thu hut khan gia va nang tam thuong hieu cua ban. Du ban co cau hoi, can bao gia, hay muon thao luan ve du an tiep theo, chung toi rat mong duoc lang nghe tu ban.",
          socialIntro: "Theo doi chung toi tren mang xa hoi de cap nhat tin tuc moi nhat, du an va noi dung hau truong",
          cta: {
            label: "DICH VU CUA CHUNG TOI",
            url: "#services"
          },
          contactTitle: "CACH LIEN HE VOI CHUNG TOI",
          contactDescription: "Hoac gui tin nhan cho chung toi. Dien vao bieu mau ben duoi, chung toi se phan hoi ban trong vong 24 gio.",
          contactLinks: [
            { label: "Email", value: "contact@stepv.studio", href: "mailto:contact@stepv.studio" },
            { label: "Phone", value: "+49-176-21129718", href: "tel:+4917621129718" }
          ],
          formTitle: "Gui tin nhan",
          formDescription: "Dien thong tin de chung toi co the tu van nhanh nhat.",
          fields: [
            { name: "name", label: "Ho va ten*", type: "text", placeholder: "Ten cua ban", required: true },
            { name: "email", label: "E-Mail*", type: "email", placeholder: "name@example.com", required: true },
            { name: "service", label: "Danh muc dich vu", type: "select", placeholder: "Chon dich vu", required: false, options: [
              { label: "3D Product Animation", value: "product-animation" },
              { label: "3D Still Image", value: "still-image" },
              { label: "Consulting", value: "consulting" }
            ] },
            { name: "message", label: "Tin nhan", type: "textarea", placeholder: "Ban muon chung toi ho tro dieu gi?", required: false }
          ],
          privacyText: "Toi dong y voi CHINH SACH BAO MAT",
          submitLabel: "GUI",
          promiseHighlight: "Chung toi se phan hoi trong 24 gio lam viec.",
          socialLinks: [
            { platform: "YouTube", url: "https://youtube.com/@stepv", icon: "Youtube" },
            { platform: "TikTok", url: "https://tiktok.com/@stepv", icon: "Music4" },
            { platform: "Facebook", url: "https://facebook.com/stepvstudio", icon: "Facebook" },
            { platform: "Instagram", url: "https://instagram.com/stepvstudio", icon: "Instagram" }
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
            { platform: "YouTube", url: "https://youtube.com/@stepv", icon: "Youtube" },
            { platform: "TikTok", url: "https://tiktok.com/@stepv", icon: "Music4" },
            { platform: "Facebook", url: "https://facebook.com/stepvstudio", icon: "Facebook" },
            { platform: "Instagram", url: "https://instagram.com/stepvstudio", icon: "Instagram" },
            { platform: "Pinterest", url: "https://pinterest.com/stepvstudio", icon: "Palette" },
            { platform: "X", url: "https://x.com/stepvstudio", icon: "Twitter" }
          ],
          cta: { label: "LIEN HE", url: "#contact" }
        },
  "careSection":     {},
  "siteFooter":     {
          logo: "/images/logo-gold.png",
          columns: [
            {
              title: "STUDIO CUA CHUNG TOI",
              links: [
                { label: "Trang chu", url: "/", highlight: true },
                { label: "Gioi thieu", url: "/about" },
                { label: "Dich vu", url: "/services" },
                { label: "Tuyen dung", url: "/careers" }
              ]
            },
            {
              title: "DICH VU CUA CHUNG TOI",
              links: [
                { label: "Marketing", url: "/services/marketing" },
                { label: "Hinh anh kien truc", url: "/services/architecture" },
                { label: "Hinh anh san pham", url: "/services/product" },
                { label: "Hoat hinh 3D", url: "/services/animation" }
              ]
            },
            {
              title: "DIEU KHOAN CHUNG",
              links: [
                { label: "Dieu khoan su dung", url: "/terms" },
                { label: "Chinh sach bao mat", url: "/privacy" }
              ]
            }
          ],
          socialTitle: "THEO DOI CHUNG TOI",
          socialLinks: [
            { platform: "YouTube", url: "https://youtube.com/@stepv", icon: "Youtube" },
            { platform: "TikTok", url: "https://tiktok.com/@stepv", icon: "Music4" },
            { platform: "Facebook", url: "https://facebook.com/stepvstudio", icon: "Facebook" },
            { platform: "Instagram", url: "https://instagram.com/stepvstudio", icon: "Instagram" }
          ],
          locationTitle: "TRU SO TAI",
          locationLines: ["Stuttgart, Duc", "+49-176-21129718"],
          contactTitle: "LIEN HE",
          contactEmail: "contact@stepv.studio",
          copyright: "© Ban quyen 2025 - Step V Studio. Tat ca quyen duoc bao luu"
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
