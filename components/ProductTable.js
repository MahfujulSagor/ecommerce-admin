"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { appwriteConfig, databases } from "@/utils/appwrite";
import { Query } from "appwrite";

export default function ProductTable() {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [prevCursor, setPrevCursor] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useCallback(() => {
    const fetchProducts = async (id = null, direction = "next") => {
      if (isFetching) return; // Prevent multiple requests
      setIsFetching(true);

      try {
        let query = [Query.limit(8), Query.orderAsc("$createdAt")];

        if (id) {
          if (direction === "next") {
            query.push(Query.cursorAfter(id));
          } else {
            query.push(Query.cursorBefore(id));
          }
        }

        const productsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productCollectionId,
          query
        );

        const products = productsResponse.documents;

        if (products.length === 0) {
          setIsFetching(false);
          return;
        }

        // Set the pagination cursors
        setPrevCursor(products[0]?.$id || null);
        setNextCursor(products[products.length - 1]?.$id || null);

        // Fetch categories
        const categoriesResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.categoryCollectionId
        );

        const categories = categoriesResponse.documents;
        const categoryMap = {};
        categories.forEach((category) => {
          categoryMap[category.$id] = category.name;
        });

        // Map categories to products
        const updatedProducts = products.map((product) => ({
          ...product,
          category: categoryMap[product.category_id.$id] || "Unknown",
        }));

        setData(updatedProducts);
      } catch (error) {
        console.error("Fetch products failed:", error.message);
      } finally {
        setIsFetching(false);
      }
    };
  }, [isFetching]);

  useEffect(() => {
    fetchProducts();
  }, []);

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
              onClick={() => prevCursor && fetchProducts(prevCursor, "prev")}
              className={`cursor-pointer ${
                !prevCursor ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!prevCursor}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => nextCursor && fetchProducts(nextCursor, "next")}
              className={`cursor-pointer ${
                !nextCursor ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!nextCursor}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
