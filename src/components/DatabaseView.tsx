import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

type SchemaField = {
  name: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "status";
  options?: Array<{
    label: string;
    color: string;
  }>;
};

type Item = {
  _id: Id<"items">;
  pageId: Id<"pages">;
  fields: Record<string, string | number | string[] | null>;
  ownerId: Id<"users">;
};

type View = {
  _id: Id<"views">;
  name: string;
  type: "table" | "list" | "gallery" | "calendar" | "kanban";
  config: {
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    groupBy?: string;
    calendarField?: string;
    kanbanField?: string;
  };
};

export function DatabaseView({ pageId }: { pageId: Id<"pages"> }) {
  const page = useQuery(api.pages.list)?.find((p) => p._id === pageId);
  const views = useQuery(api.database.getViews, { pageId }) || [];
  const items = useQuery(api.database.getItems, { pageId }) || [];
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [isAddingView, setIsAddingView] = useState(false);
  const [selectedView, setSelectedView] = useState<Id<"views"> | null>(null);
  const addColumn = useMutation(api.database.addColumn);
  const deleteItem = useMutation(api.database.deleteItem);
  const createView = useMutation(api.database.createView);
  const deleteView = useMutation(api.database.deleteView);

  if (!page || page.type !== "database" || !page.schema) return null;

  const schema = page.schema as SchemaField[];
  const currentView = views.find((v) => v._id === selectedView) || views[0];

  const handleAddColumn = async (column: SchemaField) => {
    await addColumn({ pageId, column });
    setIsAddingColumn(false);
  };

  const handleDeleteItem = async (itemId: Id<"items">) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItem({ id: itemId });
    }
  };

  const handleAddView = async (name: string, type: View["type"]) => {
    const viewId = await createView({
      pageId,
      name,
      type,
      config: {},
    });
    setSelectedView(viewId);
    setIsAddingView(false);
  };

  const handleDeleteView = async (viewId: Id<"views">) => {
    if (confirm("Are you sure you want to delete this view?")) {
      await deleteView({ id: viewId });
      if (selectedView === viewId) {
        setSelectedView(null);
      }
    }
  };

  // If there are no views yet, show a message
  if (!currentView) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsAddingView(true)}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            + New View
          </button>
        </div>
        {isAddingView && (
          <AddViewForm onSubmit={handleAddView} onCancel={() => setIsAddingView(false)} />
        )}
        <div className="text-center py-8 text-gray-500">
          Create a view to get started
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <select
            value={currentView._id}
            onChange={(e) => setSelectedView(e.target.value as Id<"views">)}
            className="px-2 py-1 border rounded"
          >
            {views.map((view) => (
              <option key={view._id} value={view._id}>
                {view.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddingView(true)}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
          >
            + New View
          </button>
          {views.length > 1 && (
            <button
              onClick={() => handleDeleteView(currentView._id)}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50 text-red-500"
            >
              Delete View
            </button>
          )}
        </div>
        <button
          onClick={() => setIsAddingColumn(true)}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          + Add Column
        </button>
      </div>

      {isAddingView && (
        <AddViewForm onSubmit={handleAddView} onCancel={() => setIsAddingView(false)} />
      )}

      {isAddingColumn && (
        <AddColumnForm onSubmit={handleAddColumn} onCancel={() => setIsAddingColumn(false)} />
      )}

      {editingItem ? (
        <ItemEditor
          item={editingItem}
          schema={schema}
          pageId={pageId}
          onClose={() => setEditingItem(null)}
        />
      ) : (
        <>
          <NewItemForm schema={schema} pageId={pageId} />
          {renderView(currentView, items, schema, {
            onEdit: setEditingItem,
            onDelete: handleDeleteItem,
          })}
        </>
      )}
    </div>
  );
}

function AddViewForm({ onSubmit, onCancel }: {
  onSubmit: (name: string, type: View["type"]) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<View["type"]>("table");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onSubmit(name, type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-medium mb-4">Add New View</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">View Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">View Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as View["type"])}
            className="w-full px-2 py-1 border rounded"
          >
            <option value="table">Table</option>
            <option value="list">List</option>
            <option value="gallery">Gallery</option>
            <option value="calendar">Calendar</option>
            <option value="kanban">Kanban</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add View
          </button>
        </div>
      </form>
    </div>
  );
}

function AddColumnForm({ onSubmit, onCancel }: {
  onSubmit: (column: SchemaField) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<SchemaField["type"]>("text");
  const [options, setOptions] = useState<SchemaField["options"]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onSubmit({ name, type, options });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-medium mb-4">Add New Column</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Column Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Column Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SchemaField["type"])}
            className="w-full px-2 py-1 border rounded"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="select">Select</option>
            <option value="multiselect">Multi-select</option>
            <option value="status">Status</option>
          </select>
        </div>
        {(type === "select" || type === "multiselect" || type === "status") && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Options</label>
            {options?.map((option, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...(options || [])];
                    newOptions[index] = { ...option, label: e.target.value };
                    setOptions(newOptions);
                  }}
                  className="flex-1 px-2 py-1 border rounded"
                  placeholder="Option label"
                />
                <input
                  type="color"
                  value={option.color}
                  onChange={(e) => {
                    const newOptions = [...(options || [])];
                    newOptions[index] = { ...option, color: e.target.value };
                    setOptions(newOptions);
                  }}
                  className="w-12 px-1 border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = [...(options || [])];
                    newOptions.splice(index, 1);
                    setOptions(newOptions);
                  }}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-50 text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setOptions([...(options || []), { label: "", color: "#000000" }])}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
            >
              + Add Option
            </button>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Column
          </button>
        </div>
      </form>
    </div>
  );
}

function ItemEditor({
  item,
  schema,
  pageId,
  onClose,
}: {
  item: Item;
  schema: SchemaField[];
  pageId: Id<"pages">;
  onClose: () => void;
}) {
  const [fields, setFields] = useState(item.fields);
  const updateItem = useMutation(api.database.updateItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateItem({ id: item._id, fields });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-medium mb-4">Edit Item</h3>
        {schema.map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium mb-1">{field.name}</label>
            {renderFieldEditor(field, fields[field.name], (value) =>
              setFields({ ...fields, [field.name]: value })
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function NewItemForm({ schema, pageId }: { schema: SchemaField[]; pageId: Id<"pages"> }) {
  const [fields, setFields] = useState<Record<string, string | number | string[] | null>>({});
  const createItem = useMutation(api.database.createItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createItem({ pageId, fields });
    setFields({});
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
      <div className="grid grid-cols-3 gap-4">
        {schema.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.name}</label>
            {renderFieldEditor(field, fields[field.name], (value) =>
              setFields({ ...fields, [field.name]: value })
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Item
        </button>
      </div>
    </form>
  );
}

function renderField(value: string | number | string[] | null, field: SchemaField) {
  if (value === null) return null;

  switch (field.type) {
    case "text":
    case "number":
      return value;
    case "date":
      return new Date(value as string).toLocaleDateString();
    case "select":
    case "status":
      const option = field.options?.find((opt) => opt.label === value);
      return option ? (
        <span
          className="inline-block px-2 py-1 rounded text-sm"
          style={{ backgroundColor: option.color + "40", color: option.color }}
        >
          {option.label}
        </span>
      ) : value;
    case "multiselect":
      return (value as string[]).map((v) => {
        const option = field.options?.find((opt) => opt.label === v);
        return option ? (
          <span
            key={v}
            className="inline-block px-2 py-1 rounded text-sm mr-1"
            style={{ backgroundColor: option.color + "40", color: option.color }}
          >
            {option.label}
          </span>
        ) : v;
      });
    default:
      return String(value);
  }
}

function renderFieldEditor(
  field: SchemaField,
  value: string | number | string[] | null,
  onChange: (value: string | number | string[] | null) => void
) {
  switch (field.type) {
    case "text":
      return (
        <input
          type="text"
          value={value as string || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={value as number || ""}
          onChange={(e) => onChange(e.target.valueAsNumber || null)}
          className="w-full px-2 py-1 border rounded"
        />
      );
    case "date":
      return (
        <input
          type="date"
          value={value as string || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
      );
    case "select":
    case "status":
      return (
        <select
          value={value as string || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "multiselect":
      return (
        <select
          multiple
          value={value as string[] || []}
          onChange={(e) =>
            onChange(Array.from(e.target.selectedOptions, (option) => option.value))
          }
          className="w-full px-2 py-1 border rounded"
        >
          {field.options?.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      );
    default:
      return null;
  }
}

function renderView(
  view: View,
  items: Item[],
  schema: SchemaField[],
  actions: {
    onEdit: (item: Item) => void;
    onDelete: (itemId: Id<"items">) => void;
  }
) {
  switch (view.type) {
    case "table":
      return (
        <div className="border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {schema.map((field) => (
                  <th key={field.name} className="px-4 py-2 text-left border-b">
                    {field.name}
                  </th>
                ))}
                <th className="px-4 py-2 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b">
                  {schema.map((field) => (
                    <td key={field.name} className="px-4 py-2">
                      {renderField(item.fields[field.name], field)}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => actions.onEdit(item)}
                      className="text-blue-500 hover:text-blue-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => actions.onDelete(item._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "list":
      return (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item._id} className="border rounded p-4">
              <div className="grid grid-cols-2 gap-4">
                {schema.map((field) => (
                  <div key={field.name}>
                    <div className="text-sm font-medium text-gray-500">{field.name}</div>
                    <div>{renderField(item.fields[field.name], field)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => actions.onEdit(item)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => actions.onDelete(item._id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      );

    case "gallery":
      return (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="border rounded p-4">
              <div className="space-y-2">
                {schema.map((field) => (
                  <div key={field.name}>
                    <div className="text-sm font-medium text-gray-500">{field.name}</div>
                    <div>{renderField(item.fields[field.name], field)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => actions.onEdit(item)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => actions.onDelete(item._id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      );

    case "calendar":
      if (!view.config.calendarField) {
        return (
          <div className="text-center py-8 text-gray-500">
            Please configure a date field for the calendar view
          </div>
        );
      }
      // Calendar view implementation would go here
      return (
        <div className="text-center py-8 text-gray-500">
          Calendar view coming soon
        </div>
      );

    case "kanban":
      if (!view.config.kanbanField) {
        return (
          <div className="text-center py-8 text-gray-500">
            Please configure a status field for the kanban view
          </div>
        );
      }
      // Kanban view implementation would go here
      return (
        <div className="text-center py-8 text-gray-500">
          Kanban view coming soon
        </div>
      );

    default:
      return null;
  }
}
