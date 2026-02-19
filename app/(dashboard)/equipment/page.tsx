"use client";

import { useState } from 'react';
import { 
  Package, Search, Plus, Filter, Box, Shirt, Shield,
  AlertTriangle, CheckCircle, Clock, ChevronRight, Edit3, Trash2,
  Archive, Tag, Calendar, Users
} from 'lucide-react';

// Sample equipment data
const equipmentItems = [
  { id: '1', name: 'Training Cones (Set of 50)', category: 'Training', quantity: 50, available: 45, condition: 'Good', lastChecked: '2024-12-20' },
  { id: '2', name: 'Soccer Balls - Size 5', category: 'Balls', quantity: 30, available: 28, condition: 'Good', lastChecked: '2024-12-22' },
  { id: '3', name: 'Goal Nets (Full Size)', category: 'Goals', quantity: 4, available: 4, condition: 'Excellent', lastChecked: '2024-12-15' },
  { id: '4', name: 'Training Bibs - Red', category: 'Apparel', quantity: 20, available: 18, condition: 'Fair', lastChecked: '2024-12-18' },
  { id: '5', name: 'Training Bibs - Blue', category: 'Apparel', quantity: 20, available: 20, condition: 'Good', lastChecked: '2024-12-18' },
  { id: '6', name: 'Agility Ladders', category: 'Training', quantity: 8, available: 7, condition: 'Good', lastChecked: '2024-12-21' },
  { id: '7', name: 'First Aid Kit', category: 'Medical', quantity: 3, available: 3, condition: 'Excellent', lastChecked: '2024-12-25' },
  { id: '8', name: 'Water Bottles (Team Set)', category: 'Hydration', quantity: 25, available: 22, condition: 'Good', lastChecked: '2024-12-20' },
];

const categories = ['All', 'Training', 'Balls', 'Goals', 'Apparel', 'Medical', 'Hydration'];

const equipmentStats = {
  totalItems: 160,
  available: 147,
  checkedOut: 13,
  needsAttention: 2,
};

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [addBtnHover, setAddBtnHover] = useState(false);

  const filteredItems = equipmentItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const statCards = [
    { label: "Total Items", value: equipmentStats.totalItems, icon: Package, color: "#a855f7" },
    { label: "Available", value: equipmentStats.available, icon: CheckCircle, color: "#22c55e" },
    { label: "Checked Out", value: equipmentStats.checkedOut, icon: Clock, color: "#3b82f6" },
    { label: "Needs Attention", value: equipmentStats.needsAttention, icon: AlertTriangle, color: "#f59e0b" },
  ];

  const getConditionStyle = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
      case 'Good':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'Fair':
        return { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' };
      case 'Poor':
        return { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return { background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.3)' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Training': return Box;
      case 'Balls': return Package;
      case 'Goals': return Shield;
      case 'Apparel': return Shirt;
      default: return Package;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(75, 0, 130, 0.08) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(138, 43, 226, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px 0 rgba(138, 43, 226, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>
              Equipment Manager
            </h1>
            <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '0.95rem' }}>
              Track, manage, and maintain team equipment inventory
            </p>
          </div>
          
          <button
            onMouseEnter={() => setAddBtnHover(true)}
            onMouseLeave={() => setAddBtnHover(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              background: addBtnHover
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: addBtnHover ? 'scale(1.02)' : 'scale(1)',
              boxShadow: addBtnHover ? '0 0 20px rgba(168, 85, 247, 0.4)' : 'none',
            }}
          >
            <Plus style={{ height: '18px', width: '18px' }} />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '16px',
        marginBottom: '24px',
      }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            onMouseEnter={() => setHoveredStat(stat.label)}
            onMouseLeave={() => setHoveredStat(null)}
            style={{
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.12) 0%, rgba(75, 0, 130, 0.08) 100%)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${hoveredStat === stat.label ? 'rgba(168, 85, 247, 0.5)' : 'rgba(138, 43, 226, 0.25)'}`,
              borderRadius: '14px',
              padding: '18px',
              transition: 'all 0.2s',
              transform: hoveredStat === stat.label ? 'translateY(-2px)' : 'none',
              boxShadow: hoveredStat === stat.label ? '0 8px 25px rgba(138, 43, 226, 0.3)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '10px',
                background: `${stat.color}20`,
              }}>
                <stat.icon style={{ height: '20px', width: '20px', color: stat.color }} />
              </div>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>{stat.label}</p>
                <p style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: '4px 0 0 0' }}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Category Filter */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.12) 0%, rgba(75, 0, 130, 0.08) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(138, 43, 226, 0.25)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{
            flex: '1 1 300px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(138, 43, 226, 0.1)',
            border: '1px solid rgba(138, 43, 226, 0.2)',
          }}>
            <Search style={{ height: '18px', width: '18px', color: '#a855f7' }} />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            />
          </div>
          
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: categoryFilter === category
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                    : hoveredCategory === category
                      ? 'rgba(138, 43, 226, 0.2)'
                      : 'rgba(138, 43, 226, 0.1)',
                  color: categoryFilter === category ? '#fff' : '#c4b5fd',
                  fontWeight: categoryFilter === category ? '600' : '500',
                  fontSize: '0.85rem',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.12) 0%, rgba(75, 0, 130, 0.08) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(138, 43, 226, 0.25)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
          padding: '16px 20px',
          background: 'rgba(138, 43, 226, 0.1)',
          borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
          gap: '12px',
        }}>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Item</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Category</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Quantity</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Condition</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Last Checked</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Actions</span>
        </div>

        {/* Table Body */}
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const CategoryIcon = getCategoryIcon(item.category);
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
                  padding: '16px 20px',
                  borderBottom: index < filteredItems.length - 1 ? '1px solid rgba(138, 43, 226, 0.1)' : 'none',
                  alignItems: 'center',
                  gap: '12px',
                  background: hoveredItem === item.id ? 'rgba(138, 43, 226, 0.08)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                {/* Item Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'rgba(168, 85, 247, 0.15)',
                  }}>
                    <CategoryIcon style={{ height: '18px', width: '18px', color: '#a855f7' }} />
                  </div>
                  <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</span>
                </div>

                {/* Category */}
                <span style={{ color: '#c4b5fd', fontSize: '0.85rem' }}>{item.category}</span>

                {/* Quantity */}
                <div>
                  <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{item.available}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}> / {item.quantity}</span>
                </div>

                {/* Condition */}
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  ...getConditionStyle(item.condition),
                }}>
                  {item.condition}
                </span>

                {/* Last Checked */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar style={{ height: '14px', width: '14px', color: '#6b7280' }} />
                  <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                    {new Date(item.lastChecked).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    <Edit3 style={{ height: '14px', width: '14px', color: '#60a5fa' }} />
                  </button>
                  <button style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    <Trash2 style={{ height: '14px', width: '14px', color: '#f87171' }} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Package style={{ height: '40px', width: '40px', color: '#a855f7' }} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', margin: '0 0 8px 0' }}>
              No equipment found
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
