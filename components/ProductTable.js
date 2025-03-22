"use client";

import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "@/utils/columns";
import { useAppwrite } from "@/context/AppwriteContext";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { appwriteConfig, databases } from "@/utils/appwrite";
import { Query } from "appwrite";

export default function ProductTable() {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async ( id, path ) => {
    try {
      const query = [Query.limit(5), Query.orderDesc("$createdAt")];

      if (id && path === "before") {
        query.push(Query.cursorBefore(id));
      }else if (id && path === "after") {
        query.push(Query.cursorAfter(id));
      }

      const productsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productCollectionId,
        query
      );

      const products = productsResponse.documents;

      const lastElement = products[products.length - 1].$id;

      // Fetch categories (if necessary)
      const categoriesResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.categoryCollectionId
      );
      const categories = categoriesResponse.documents;

      const categoryMap = {};
      categories.forEach((category) => {
        categoryMap[category.$id] = category.name;
      });

      const updatedProducts = products.map((product) => ({
        ...product,
        category: categoryMap[product.category_id] || "Unknown",
      }));

      setData(updatedProducts);
      setNextCursor(lastElement);
    } catch (error) {
      console.error("Fetch products failed:", error.message);
      return [];
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 mt-24">
      <Input
        placeholder="Search by name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full max-w-sm"
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="capitalize">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table
            .getRowModel()
            .rows.filter((row) =>
              row.original.name.toLowerCase().includes(filter.toLowerCase())
            )
            .map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="capitalize" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => fetchProducts(nextCursor, "before")}
              className='cursor-pointer'
            />
          </PaginationItem>
          <PaginationLink>1</PaginationLink>
          <PaginationItem></PaginationItem>
          <PaginationLink>2</PaginationLink>
          <PaginationItem></PaginationItem>
          <PaginationLink>3</PaginationLink>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => fetchProducts(nextCursor, "after")}
              className='cursor-pointer'
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
