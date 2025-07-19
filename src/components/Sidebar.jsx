import { useState } from "react";

const Sidebar = ({ pins, onSelectPin, onDeletePin, onEditPin }) => {
  const [editingPinId, setEditingPinId] = useState(null);
  const [editedRemark, setEditedRemark] = useState("");

  return (
    <div className="w-full sm:w-80 h-72 sm:h-screen bg-white shadow-lg p-4 overflow-y-auto border-b sm:border-b-0 sm:border-r border-gray-300">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center text-blue-700">
        📍 Saved Pins
      </h2>

      {pins.length === 0 ? (
        <p className="text-gray-500 text-sm sm:text-base text-center">
          No saved pins yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {pins.map((pin) => {
            const isEditing = editingPinId === pin._id;

            return (
              <li
                key={pin._id}
                className={`border rounded-lg p-3 sm:p-4 transition group ${
                  isEditing ? "bg-yellow-50" : "hover:bg-blue-50 cursor-pointer"
                } shadow-sm`}
                onClick={() => !isEditing && onSelectPin(pin)}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="border px-2 py-1 rounded w-full text-sm"
                      value={editedRemark}
                      onChange={(e) => setEditedRemark(e.target.value)}
                      placeholder="Edit remark"
                    />
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <button
                        className="text-green-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPin(pin._id, { remark: editedRemark });
                          setEditingPinId(null);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPinId(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-800 break-words">
                      📌 {pin.remark || "No remark"}
                    </p>
                    <p className="text-xs text-gray-500 break-words">
                      {pin.address || "No address"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPinId(pin._id);
                          setEditedRemark(pin.remark || "");
                        }}
                      >
                        Edit Remark
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePin(pin._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
