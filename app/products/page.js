import ProductTable from "@/components/ProductTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Products = () => {
  return (
    <div>
      <Button className="">
        <Link href={"/products/new"} className="capitalize font-medium">
          add new product
        </Link>
      </Button>
      <ProductTable />
    </div>
  );
};

export default Products;
