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

export default function ProductTable() {
  const { fetchProducts } = useAppwrite();
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    // fetch products from appwrite database
    const getProducts = async () => {
      try {
        const products = await fetchProducts();
        if (!products) {
          console.error("Fetch products failed:", products.error.message);
          return [];
        }
        setData(products);
      } catch (error) {
        console.error("Fetch products failed:", error.message);
        return [];
      }
    };

    getProducts();
  }, [fetchProducts]);

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
    </div>
  );
}
