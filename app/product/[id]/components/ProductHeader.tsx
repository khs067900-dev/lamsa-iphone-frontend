import Link from "next/link";
import { IoHomeOutline, IoChevronBack } from "react-icons/io5";
import BackButton from "./BackButton";
import ShareButton from "./ShareButton";

export default function ProductHeader({ 
  productName, 
  category 
}: { 
  productName: string; 
  category?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <BackButton />
        
        <nav className="hidden sm:flex items-center gap-1.5 text-[11px]" style={{ color: "#A77D4B" }}>
          <Link href="/" className="hover:text-[#BC9255] transition flex items-center gap-1">
            <IoHomeOutline size={12} /> الرئيسية
          </Link>
          <IoChevronBack size={10} className="opacity-40" />
          {category && (
            <>
              <span className="opacity-60">{category}</span>
              <IoChevronBack size={10} className="opacity-40" />
            </>
          )}
          <span className="font-semibold truncate max-w-[200px]" style={{ color: "#1F2C3E" }}>
            {productName}
          </span>
        </nav>
      </div>
      
      <ShareButton productName={productName} />
    </div>
  );
}
