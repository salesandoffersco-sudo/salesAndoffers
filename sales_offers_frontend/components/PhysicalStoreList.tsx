"use client";

import { useState } from "react";
import { FiMapPin, FiClock, FiPhone, FiNavigation } from "react-icons/fi";
import Button from "./Button";

interface PhysicalStore {
    id: number;
    store_name: string;
    address: string;
    phone_number: string;
    opening_hours: string;
    map_url: string;
    latitude?: number;
    longitude?: number;
    images?: Array<{
        id: number;
        image_url: string;
    }>;
}

interface PhysicalStoreListProps {
    stores: PhysicalStore[];
}

export default function PhysicalStoreList({ stores }: PhysicalStoreListProps) {
    if (!stores || stores.length === 0) return null;

    return (
        <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))] mt-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">Available at Physical Stores</h3>

            <div className="space-y-4">
                {stores.map((store) => (
                    <div
                        key={store.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{store.store_name}</h4>

                                <div className="space-y-2 mt-2">
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                                        <span>{store.address}</span>
                                    </div>

                                    {store.opening_hours && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <FiClock className="w-4 h-4 flex-shrink-0 text-purple-600" />
                                            <span>{store.opening_hours}</span>
                                        </div>
                                    )}

                                    {store.phone_number && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <FiPhone className="w-4 h-4 flex-shrink-0 text-purple-600" />
                                            <span>{store.phone_number}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {store.map_url && (
                                <a
                                    href={store.map_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0"
                                >
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <FiNavigation className="w-3 h-3" />
                                        <span className="hidden sm:inline">Get Directions</span>
                                    </Button>
                                </a>
                            )}
                        </div>

                        {store.images && store.images.length > 0 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                {store.images.map((img) => (
                                    <img
                                        key={img.id}
                                        src={img.image_url}
                                        alt={`${store.store_name} interior`}
                                        className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
