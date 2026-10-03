import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Heart,
  Users,
  Coffee,
  Activity,
  Calendar,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { Memory, MemoryCategory, MemoryImportance } from '../types';

interface MemoryViewProps {
  memories: Memory[];
  onAddMemory: (content: string, category: MemoryCategory, importance: MemoryImportance) => Promise<void>;
  onEditMemory: (id: string, updates: Partial<Memory>) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memories,
  onAddMemory,
  onEditMemory,
  onDeleteMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  // Form states
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('family');
  const [newImportance, setNewImportance] = useState<MemoryImportance>('high');

  const categories = [
    { id: 'all', label: 'All Memories', icon: BookOpen },
    { id: 'family', label: 'Family & Friends', icon: Users },
    { id: 'preference', label: 'Preferences', icon: Heart },
    { id: 'medical', label: 'Medical & Health', icon: Activity },
    { id: 'routine', label: 'Routines', icon: Coffee },
    { id: 'milestone', label: 'Milestones', icon: Calendar },
  ];

  const filteredMemories = memories.filter((mem) => {
    const matchesCategory = selectedCategory === 'all' || mem.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    await onAddMemory(newContent, newCategory, newImportance);
    setNewContent('');
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory || !newContent.trim()) return;

    await onEditMemory(editingMemory.id, {
      content: newContent,
      category: newCategory,
      importance: newImportance,
    });
    setEditingMemory(null);
    setNewContent('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in text-[#18181B]">
      {/* Header Banner */}
      <div className="bg-[#18181B] rounded-3xl p-6 sm:p-8 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white text-[#111827] text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4 text-[#18181B]" />
            <span>Personal Knowledge Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Memory Vault</h1>
          <p className="text-gray-300 text-sm mt-1 max-w-xl leading-relaxed font-medium">
            All stored personal facts, loved ones, preferences, and notes used for conversational recall.
          </p>
        </div>

        <button
          onClick={() => {
            setNewContent('');
            setNewCategory('family');
            setNewImportance('high');
            setIsAddModalOpen(true);
          }}
          id="add-memory-btn"
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#111827] font-bold text-sm transition-all whitespace-nowrap min-h-[44px] shadow-xs"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stored facts (e.g., Priya, tea, doctor)..."
            id="search-memory-input"
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#18181B] shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] border ${
                  isActive
                    ? 'bg-[#18181B] text-white border-[#18181B]'
                    : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Memory Cards Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB] space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 text-[#6B7280] mx-auto" />
          <h3 className="text-lg font-bold text-[#111827]">No memories found</h3>
          <p className="text-sm text-[#6B7280] font-medium">
            {searchQuery ? 'Try adjusting your search terms.' : 'Click "Add New Memory" above to store a new fact!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between space-y-4 shadow-xs hover:border-[#18181B] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F9FAFB] text-[#374151] text-xs font-bold uppercase tracking-wider capitalize border border-[#E5E7EB]">
                    <Tag className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>{mem.category}</span>
                  </span>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-[#18181B] text-white">
                    {mem.importance} Priority
                  </span>
                </div>

                <p className="text-base sm:text-lg font-bold text-[#111827] leading-relaxed">
                  "{mem.content}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-xs text-[#6B7280] font-medium">
                  {mem.source === 'chat' ? '✨ Saved from conversation' : '✍️ Added manually'}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingMemory(mem);
                      setNewContent(mem.content);
                      setNewCategory(mem.category);
                      setNewImportance(mem.importance);
                    }}
                    title="Edit Memory"
                    className="p-2 rounded-xl text-[#374151] hover:bg-gray-100 border border-[#E5E7EB] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteMemory(mem.id)}
                    title="Delete Memory"
                    className="p-2 rounded-xl text-[#374151] hover:bg-gray-100 border border-[#E5E7EB] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Memory */}
      {(isAddModalOpen || editingMemory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-[#E5E7EB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h2 className="text-xl font-bold text-[#111827]">
                {editingMemory ? 'Edit Memory Fact' : 'Add New Personal Memory'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMemory(null);
                }}
                className="p-2 rounded-xl text-[#374151] hover:bg-gray-100 border border-[#E5E7EB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingMemory ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase mb-1">
                  Memory Fact Content
                </label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. My daughter's name is Priya or I like warm chamomile tea."
                  id="memory-content-textarea"
                  className="w-full p-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#374151] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                    className="w-full p-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#111827]"
                  >
                    <option value="family">Family & Friends</option>
                    <option value="preference">Preference</option>
                    <option value="medical">Medical & Health</option>
                    <option value="routine">Routine</option>
                    <option value="milestone">Milestone</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] uppercase mb-1">
                    Importance
                  </label>
                  <select
                    value={newImportance}
                    onChange={(e) => setNewImportance(e.target.value as MemoryImportance)}
                    className="w-full p-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#111827]"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMemory(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-[#374151] font-bold text-xs hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newContent.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#18181B] disabled:opacity-50 text-white font-bold text-xs hover:bg-[#27272A] transition-all"
                >
                  {editingMemory ? 'Save Changes' : 'Add Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
