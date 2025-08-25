import { BulkSendForm } from "#/components/bulk-send-form";

export default function BulkSendPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Bulk SMS Send</h1>
        <BulkSendForm />
      </div>
    </div>
  );
}
