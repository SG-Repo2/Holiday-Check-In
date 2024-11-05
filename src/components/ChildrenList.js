// src/components/ChildrenList.js
import React, { useContext, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const ChildrenList = ({ attendee, onVerifyChild, verifiedChildren }) => {
  const { updateChild, addChild, removeChild } = useContext(AttendeeContext);
  const [editingChild, setEditingChild] = useState(null);
  const [newChild, setNewChild] = useState({ name: '', age: '', gender: '' });

  const handleVerify = (child) => {
    onVerifyChild(child);
  };

  const handleEdit = (child) => {
    setEditingChild({ ...child, originalName: child.name });
  };

  const handleSaveEdit = () => {
    if (!editingChild.name || !editingChild.age || !editingChild.gender) {
      alert('Please fill in all fields');
      return;
    }

    updateChild(attendee.id, editingChild.originalName || editingChild.name, {
      name: editingChild.name,
      age: parseInt(editingChild.age),
      gender: editingChild.gender,
    });
    setEditingChild(null);
  };

  const handleAddChild = () => {
    if (!newChild.name || !newChild.age || !newChild.gender) {
      alert('Please fill in all fields');
      return;
    }

    addChild(attendee.id, {
      ...newChild,
      age: parseInt(newChild.age),
      verified: false
    });
    setNewChild({ name: '', age: '', gender: '' });
  };

  const isChildVerified = (childName) => {
    return verifiedChildren.some(vc => vc.name === childName);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Children</h3>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th className="text-left px-2">Name</th>
            <th className="text-left px-2">Age</th>
            <th className="text-left px-2">Gender</th>
            <th className="text-left px-2">Status</th>
            <th className="text-left px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {attendee.children.map((child) => (
            <tr key={child.name} className="border-b">
              <td className="py-2 px-2">{child.name}</td>
              <td className="py-2 px-2">{child.age}</td>
              <td className="py-2 px-2">{child.gender}</td>
              <td className="py-2 px-2">
                {isChildVerified(child.name) ? (
                  <span className="text-green-600">✓ Verified</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </td>
              <td className="py-2 px-2">
                <div className="space-x-2">
                  {!isChildVerified(child.name) && (
                    <button
                      onClick={() => handleVerify(child)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(child)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeChild(attendee.id, child.name)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white p-4 rounded max-w-md w-full">
            <h4 className="text-lg mb-4">Edit Child Information</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={editingChild.name}
                onChange={(e) => setEditingChild({ ...editingChild, name: e.target.value })}
                className="block w-full p-2 border rounded"
                placeholder="Name"
              />
              <input
                type="number"
                value={editingChild.age}
                onChange={(e) => setEditingChild({ ...editingChild, age: e.target.value })}
                className="block w-full p-2 border rounded"
                placeholder="Age"
                min="0"
                max="18"
              />
              <select
                value={editingChild.gender}
                onChange={(e) => setEditingChild({ ...editingChild, gender: e.target.value })}
                className="block w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setEditingChild(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 border rounded">
        <h4 className="text-lg mb-4">Add New Child</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={newChild.name}
            onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
            className="p-2 border rounded"
            placeholder="Name"
          />
          <input
            type="number"
            value={newChild.age}
            onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
            className="p-2 border rounded"
            placeholder="Age"
            min="0"
            max="18"
          />
          <select
            value={newChild.gender}
            onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <button
          onClick={handleAddChild}
          className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Child
        </button>
      </div>
    </div>
  );
};

export default ChildrenList;
