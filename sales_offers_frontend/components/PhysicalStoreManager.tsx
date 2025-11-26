"use client";

import { useState } from "react";
import { FiPlus, FiTrash2, FiMapPin, FiClock, FiPhone, FiImage } from "react-icons/fi";
import Button from "./Button";

interface PhysicalStore {
    id?: number;
    store_name: string;
    address: string;
    phone_number: string;
    opening_hours: string;
    map_url: string;
    latitude?: number;
    longitude?: number;
    imageFiles?: File[];
}

interface PhysicalStoreManagerProps {
    stores: PhysicalStore[];
    onChange: (stores: PhysicalStore[]) => void;
}

export default function PhysicalStoreManager({ stores, onChange }: PhysicalStoreManagerProps) {
    const [newStore, setNewStore] = useState<PhysicalStore>({
        store_name: "",
        address: "",
        phone_number: "",
        opening_hours: "",
        map_url: "",
        imageFiles: []
    });
    const [isAdding, setIsAdding] = useState(false);

    const handleAddStore = () => {
        if (newStore.store_name && newStore.address) {
            onChange([...stores, { ...newStore }]);
            setNewStore({
                store_name: "",
                address: "",
                phone_number: "",
                opening_hours: "",
                map_url: "",
                imageFiles: []
            });
            setIsAdding(false);
        }
    };

    const handleRemoveStore = (index: number) => {
        const updatedStores = [...stores];
        updatedStores.splice(index, 1);
        onChange(updatedStores);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewStore(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Physical Stores ({stores.length})
                </label>
                {!isAdding && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        type="button"
                    >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Add Store
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">New Store Location</h4>

                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Store Name</label>
                        <input
                            type="text"
                            name="store_name"
                            value={newStore.store_name}
                            onChange={handleChange}
                            placeholder="e.g. Nairobi CBD Branch"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Address</label>
                        <div className="relative">
                            <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="address"
                                value={newStore.address}
                                onChange={handleChange}
                                placeholder="Full address"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={newStore.phone_number}
                                    onChange={handleChange}
                                    placeholder="+254..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Opening Hours</label>
                            <div className="relative">
                                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="opening_hours"
                                    value={newStore.opening_hours}
                                    onChange={handleChange}
                                    placeholder="e.g. 9am - 6pm"
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Google Maps Link (Optional)</label>
                        <input
                            type="url"
                            name="map_url"
                            value={newStore.map_url}
                            onChange={handleChange}
                            placeholder="https://maps.google.com/..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Store Images (Optional)</label>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <FiImage className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-200">Select Images</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const files = Array.from(e.target.files);
                                            setNewStore(prev => ({ ...prev, imageFiles: files }));
                                        }
                                    }}
                                />
                            </label>
                            {newStore.imageFiles && newStore.imageFiles.length > 0 && (
                                <span className="text-xs text-gray-500">{newStore.imageFiles.length} file(s) selected</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAdding(false)}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddStore}
                            disabled={!newStore.store_name || !newStore.address}
                            type="button"
                        >
                            Add Store
                        </Button>
                    </div>
                </div>
            )}

            {stores.length > 0 && (
                <div className="space-y-2">
                    {stores.map((store, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                            <div className="flex-1">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100">{store.store_name}</h5>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-1 mt-1">
                                    <span className="flex items-center gap-1">
                                        <FiMapPin className="w-3 h-3" /> {store.address}
                                    </span>
                                    {store.opening_hours && (
                                        <span className="flex items-center gap-1">
                                            <FiClock className="w-3 h-3" /> {store.opening_hours}
                                        </span>
                                    )}
                                    {store.imageFiles && store.imageFiles.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <FiImage className="w-3 h-3" /> {store.imageFiles.length} images
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveStore(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                                type="button"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
