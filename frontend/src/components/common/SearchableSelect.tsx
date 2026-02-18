import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SearchableSelectItem {
    id: string;
    name: string;
    [key: string]: any;
}

interface SearchableSelectProps {
    items: SearchableSelectItem[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    displayFormat?: (item: SearchableSelectItem) => string;
    disabled?: boolean;
    className?: string;
}

export function SearchableSelect({
    items,
    value,
    onChange,
    placeholder = '검색...',
    displayFormat,
    disabled = false,
    className,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedItem = useMemo(
        () => items.find((item) => item.id === value),
        [items, value]
    );

    const formatItem = (item: SearchableSelectItem): string => {
        if (displayFormat) return displayFormat(item);
        return item.name;
    };

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(
            (item) =>
                item.name.toLowerCase().includes(term) ||
                item.id.toLowerCase().includes(term) ||
                (displayFormat && formatItem(item).toLowerCase().includes(term))
        );
    }, [items, searchTerm, displayFormat]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                setHighlightIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('[data-item]');
            items[highlightIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightIndex]);

    const handleSelect = (item: SearchableSelectItem) => {
        onChange(item.id);
        setIsOpen(false);
        setSearchTerm('');
        setHighlightIndex(-1);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightIndex((prev) =>
                    prev < filteredItems.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredItems.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightIndex >= 0 && filteredItems[highlightIndex]) {
                    handleSelect(filteredItems[highlightIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                setHighlightIndex(-1);
                break;
        }
    };

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {/* Trigger / Input */}
            <div
                className={cn(
                    'flex h-10 w-full items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background',
                    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                    disabled && 'cursor-not-allowed opacity-50',
                    isOpen && 'ring-2 ring-ring ring-offset-2'
                )}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(true);
                        inputRef.current?.focus();
                    }
                }}
            >
                <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                {isOpen ? (
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent outline-none placeholder:text-slate-500"
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setHighlightIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                ) : (
                    <span className={cn('flex-1 truncate', !selectedItem && 'text-slate-500')}>
                        {selectedItem ? formatItem(selectedItem) : placeholder}
                    </span>
                )}
                <div className="flex items-center gap-1 ml-1">
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="rounded-full p-0.5 hover:bg-slate-100"
                        >
                            <X className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                    )}
                    <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={listRef}
                    className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white py-1 shadow-lg max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95"
                >
                    {filteredItems.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-slate-500">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        filteredItems.map((item, index) => (
                            <div
                                key={item.id}
                                data-item
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
                                    highlightIndex === index && 'bg-slate-100',
                                    item.id === value && 'text-blue-600 font-medium',
                                    item.id !== value && 'hover:bg-slate-50'
                                )}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setHighlightIndex(index)}
                            >
                                <Check
                                    className={cn(
                                        'h-4 w-4 shrink-0',
                                        item.id === value ? 'opacity-100 text-blue-600' : 'opacity-0'
                                    )}
                                />
                                <span className="truncate">{formatItem(item)}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
