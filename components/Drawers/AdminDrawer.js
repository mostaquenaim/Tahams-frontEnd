'use client';

import React, { useContext, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Tooltip } from '@mui/material';
import { FiMenu, FiChevronDown, FiActivity } from 'react-icons/fi';
import { AdminDrawerContext } from '/Contexts/AdminDrawerProvider';
import { CountContext } from '../../Contexts/CountProvider';
import { CustomizationOrderContext } from '/Contexts/CustomizationOrderCountProvider';
import { NAV_CONFIG } from './Config/NavConfig';

const AdminDrawer = () => {
  const router = useRouter();
  const { isAdminOpen, setAdminIsOpen } = useContext(AdminDrawerContext);
  const { showCount } = useContext(CountContext);
  const { showCustomizedCount } = useContext(CustomizationOrderContext);

  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const currentPath = router.pathname;
    const activeSection = NAV_CONFIG.find((section) =>
      section.Tasks.some((task) => task.href === currentPath),
    );
    if (activeSection) {
      setExpandedSections((prev) => ({ ...prev, [activeSection.Name]: true }));
    }
  }, [router.pathname]);

  const toggleSection = (name) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-white/5 bg-[#0f172a] text-slate-300 shadow-2xl
        ${isAdminOpen ? 'w-72' : 'w-20'}`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
        <AnimatePresence mode="wait">
          {isAdminOpen && (
            <Link href="/admin">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <FiActivity size={18} />
                </div>
                <span className="text-lg font-bold tracking-tight text-white uppercase">
                  Nexus Admin
                </span>
              </motion.div>
            </Link>
          )}
        </AnimatePresence>

        <button
          onClick={() => setAdminIsOpen(!isAdminOpen)}
          className="p-2 rounded-xl hover:bg-white/5 hover:text-white transition-all active:scale-90"
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* Navigation Body */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 custom-scrollbar h-[calc(100vh-64px)]">
        <ul className="space-y-2">
          {NAV_CONFIG.map((section) => {
            const isExpanded = expandedSections[section.Name];
            const hasActiveChild = section.Tasks.some(
              (t) => t.href === router.pathname,
            );

            return (
              <li key={section.Name} className="group">
                {/* Section Header */}
                <button
                  onClick={() =>
                    isAdminOpen
                      ? toggleSection(section.Name)
                      : setAdminIsOpen(true)
                  }
                  className={`flex w-full items-center justify-between p-3 rounded-xl transition-all
                    ${isExpanded || hasActiveChild ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xl transition-colors ${hasActiveChild ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`}
                    >
                      {section.Icon}
                    </span>
                    {isAdminOpen && (
                      <span className="text-sm font-semibold tracking-wide">
                        {section.Name}
                      </span>
                    )}
                  </div>

                  {isAdminOpen && (
                    <FiChevronDown
                      className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      size={14}
                    />
                  )}
                </button>

                {/* Sub-menu (Tasks) */}
                <AnimatePresence>
                  {isAdminOpen && isExpanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-1 ml-4 border-l border-white/5"
                    >
                      {section.Tasks.map((task) => {
                        const isActive = router.pathname === task.href;
                        // Dynamic badges for specific labels
                        const badgeCount =
                          task.id === 'orders'
                            ? showCount
                            : task.id === 'custom'
                              ? showCustomizedCount
                              : 0;

                        return (
                          <li key={task.label}>
                            <Link href={task.href}>
                              <div
                                className={`group flex items-center justify-between mx-2 my-1 p-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                                ${
                                  isActive
                                    ? 'bg-blue-600/10 text-blue-400'
                                    : 'text-slate-400 hover:text-white hover:translate-x-1'
                                }`}
                              >
                                <span>{task.label}</span>
                                {badgeCount > 0 && (
                                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                    {badgeCount}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminDrawer;
