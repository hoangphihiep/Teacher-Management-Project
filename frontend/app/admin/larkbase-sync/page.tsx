import type { Metadata } from "next"
import LarkBaseSync from "@/components/admin/larkbase-sync"

export const metadata: Metadata = {
  title: "Đồng bộ LarkBase | Admin",
  description: "Đồng bộ dữ liệu với LarkBase",
}

export default function LarkBaseSyncPage() {
  return <LarkBaseSync />
}
