/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'k.kakaocdn.net',  // 카카오 프로필 이미지
      'ssl.pstatic.net', // 네이버 프로필 이미지
      'lh3.googleusercontent.com', // 구글 프로필 이미지
    ],
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
}

module.exports = nextConfig
