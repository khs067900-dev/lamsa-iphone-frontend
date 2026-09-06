import Image from "next/image";
import { IoAdd, IoRemove, IoClose } from "react-icons/io5";

const fmt = (n: number) => n.toLocaleString("en-US");

interface CartItemProps {
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    originalPrice?: number;
    images?: string[];
    image?: string;
  };
  qty: number;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : src.startsWith("/uploads") ? src : `${API}${src}`;

export default function CartItem({ product, qty, onUpdateQty, onRemove }: CartItemProps) {
  const price = product.salePrice ?? product.originalPrice ?? product.price;
  const rawImg = product.images?.[0] || product.image;
  const img = rawImg ? resolveImg(rawImg) : undefined;

  return (
    <div className="group relative rounded-xl overflow-hidden transition-all" style={{ backgroundColor: "#fff", border: "1px solid rgba(188,146,85,0.12)" }}>
      {/* Remove button */}
      <button
        onClick={() => onRemove(product._id)}
        className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: "rgba(239,68,68,0.08)" }}
      >
        <IoClose size={10} className="text-red-500" />
      </button>

      <div className="flex">
        {/* Image */}
        <div className="relative w-20 h-20 shrink-0" style={{ backgroundColor: "#faf7f2" }}>
          {img ? (
            <Image src={img} alt={product.name} fill className="object-contain p-2" />
          ) : (
            <span className="text-2xl flex items-center justify-center w-full h-full">📱</span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-xs font-bold line-clamp-1" style={{ color: "#0A1825" }}>{product.name}</h3>
            <p className="text-sm font-black mt-0.5 flex items-center gap-0.5" style={{ color: "#BC9255" }}>
              {fmt(price)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-4 h-4" />
            </p>
          </div>

          <div className="flex items-center justify-between mt-1">
            {/* Qty controls */}
            <div className="flex items-center rounded-md overflow-hidden" style={{ border: "1.5px solid rgba(188,146,85,0.25)" }}>
              <button onClick={() => onUpdateQty(product._id, qty - 1)} className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: "rgba(188,146,85,0.08)" }}>
                <IoRemove size={12} style={{ color: "#A77D4B" }} />
              </button>
              <span className="w-8 h-7 flex items-center justify-center text-xs font-black" style={{ color: "#0A1825", backgroundColor: "#fff" }}>{qty}</span>
              <button onClick={() => onUpdateQty(product._id, qty + 1)} className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: "rgba(188,146,85,0.08)" }}>
                <IoAdd size={12} style={{ color: "#A77D4B" }} />
              </button>
            </div>

            {qty > 1 && (
              <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: "#A77D4B" }}>
                {fmt(price * qty)} <img src="/money-icon.webp" alt="ر.س" className="inline-block w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
