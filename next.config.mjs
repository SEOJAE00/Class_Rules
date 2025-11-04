/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: "/api/proxy/:path*", // 클라이언트 요청 경로
            destination: "https://marinedocs.kro.kr/:path*", // 백엔드 서버 URL
          },
        ];
      },
};

export default nextConfig;