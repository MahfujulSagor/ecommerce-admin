import Image from "next/image";

export const columns = [
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => {
      const imageUrl = row.getValue("images")[0];
      return (
        <Image
          src={imageUrl}
          alt={row.original.name}
          width={50}
          height={50}
          priority={true}
          className="w-12 h-12 object-cover rounded"
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "storage",
    header: "Storage (GB)",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => <span>${row.getValue("price")}</span>,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => <span>{row.getValue("stock")}</span>,
  },
];
