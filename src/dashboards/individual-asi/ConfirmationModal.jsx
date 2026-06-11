// Send-instruments confirmation modal.
export default function ConfirmationModal({ isOpen, onSend, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl border border-slate-600 bg-panel p-6 shadow-2xl">
        <h3 className="mb-4 text-xl font-semibold text-white">Send these instruments?</h3>
        <p className="mb-6 text-muted">The selected CLI instruments will be sent to the designated employees.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg bg-slate-700 px-6 py-2 font-medium text-white transition-colors hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            className="rounded-lg bg-cyan-600 px-6 py-2 font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
