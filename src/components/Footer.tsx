export default function Footer() {
  return (
    <footer className="bg-purple-900/50 backdrop-blur-sm text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-center md:text-left">&copy; 2024 둥지 마켓. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-pink-300 transition-colors">이용약관</a>
            <a href="#" className="hover:text-pink-300 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-pink-300 transition-colors">고객센터</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
