// src/components/ChildrenList.js
import React, { useContext, useState } from 'react';
import { AttendeeContext } from '../AttendeeContext';

const ChildrenList = ({ attendee, onVerifyChild, verifiedChildren }) => {
  const { updateChild, removeChild } = useContext(AttendeeContext);
  const [editingChild, setEditingChild] = useState(null);
  const [newChild, setNewChild] = useState({ name: '', age: '', gender: '' });

  const handleVerify = (child) => {
    // Call verify function and show success message
    onVerifyChild(child);
    alert(`${child.name} has been verified successfully`);
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
  
    // Close the editing modal
    setEditingChild(null);
    alert('Child information updated successfully');
  };

  const handleRemoveChild = (childName) => {
    if (window.confirm('Are you sure you want to remove this child from the list?')) {
      removeChild(attendee.id, childName);
      setEditingChild(null);
      alert('Child removed successfully');
    }
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
            <th className="text-left px-5">Status</th>
          </tr>
        </thead>
        <tbody>
          {attendee.children && attendee.children.map((child) => (
            <tr key={child.name} className="border-b hover:bg-gray-50">
              <td className="py-2 px-2 font-semibold">{child.name}</td>
              <td className="py-2 px-2">{child.age}</td>
              <td className="py-2 px-2">{child.gender}</td>
              <td className="py-2 px-2">
                <div className="flex items-center justify-end space-x-2">
                  {isChildVerified(child.name) ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerify(child)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(child)}
                    className="text-blue-500 hover:text-blue-600 bg-white px-2 py-1 rounded text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
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
                value={editingChild.name || ''}
                onChange={(e) => setEditingChild(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full p-2 border rounded"
                placeholder="Name"
              />
              <input
                type="number"
                value={editingChild.age || ''}
                onChange={(e) => setEditingChild(prev => ({ ...prev, age: e.target.value }))}
                className="block w-full p-2 border rounded"
                placeholder="Age"
                min="0"
                max="18"
              />
              <select
                value={editingChild.gender || ''}
                onChange={(e) => setEditingChild(prev => ({ ...prev, gender: e.target.value }))}
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
                  onClick={() => handleRemoveChild(editingChild.name)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
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
    </div>
  );
}

export default ChildrenList;
