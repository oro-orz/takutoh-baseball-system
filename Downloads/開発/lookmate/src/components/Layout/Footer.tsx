import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 print:hidden">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Timingood Inc.
        </div>
        <div className="flex space-x-4">
          <a
            href="/terms"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            利用規約
          </a>
          <a
            href="/privacy"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            プライバシーポリシー
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;