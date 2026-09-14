'use client';

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronDown,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiShoppingBag,
} from 'react-icons/fi';
import { AdminDrawerContext } from '/Contexts/AdminDrawerProvider';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import { CountContext } from '../../Contexts/CountProvider';
import { CustomizationOrderContext } from '/Contexts/CustomizationOrderCountProvider';
import { NAV_CONFIG, NAV_GROUPS } from './Config/NavConfig';

function getInitials(name) {
  if (!name?.trim()) return 'AD';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const isActivePath = (pathname, href) =>
  pathname?.toLowerCase() === href.toLowerCase() ||
  pathname?.toLowerCase().startsWith(href.toLowerCase() + '/');

const GROUPED_SECTIONS = NAV_GROUPS.map((group) => ({
  label: group,
  sections: NAV_CONFIG.filter((section) => section.Group === group),
})).filter((group) => group.sections.length > 0);

const AdminDrawer = () => {
  const router = useRouter();
  const { isAdminOpen, setAdminIsOpen } = useContext(AdminDrawerContext);
  const { user } = useContext(AuthContext);
  const { showCount } = useContext(CountContext);
  const { showCustomizedCount } = useContext(CustomizationOrderContext);

  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const activeSection = NAV_CONFIG.find((section) =>
      section.Tasks.some((task) => isActivePath(router.pathname, task.href)),
    );
    if (activeSection) {
      setExpandedSections((prev) => ({ ...prev, [activeSection.Name]: true }));
    }
  }, [router.pathname]);

  const toggleSection = (name) => {
    setExpandedSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const getTaskBadge = (task) =>
    task.id === 'orders'
      ? showCount
      : task.id === 'custom'
        ? showCustomizedCount
        : 0;

  const displayName = user?.displayName?.trim() || 'Admin';
  const contactLine = user?.email || user?.phoneNumber || 'Administrator';

  return (
    <>
      {/* Mobile backdrop */}
      {isAdminOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setAdminIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden whitespace-nowrap border-r border-gray-200 bg-white font-sans text-gray-700 transition-[width] duration-300 ease-in-out
          ${isAdminOpen ? 'w-64 shadow-xl md:shadow-none' : 'w-20'}`}
      >
        {/* Brand */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-gray-100 px-4 ${
            isAdminOpen ? 'justify-between' : 'justify-center'
          }`}
        >
          <Link href="/admin" className="flex min-w-0 items-center overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 shadow-sm">
              <span className="text-base font-bold text-white">T</span>
            </div>
            {isAdminOpen && (
              <div className="ml-3 min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold text-gray-900">
                  Tahams
                </p>
                <p className="text-xs text-gray-500">Admin Console</p>
              </div>
            )}
          </Link>

          {isAdminOpen && (
            <button
              onClick={() => setAdminIsOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              aria-label="Collapse menu"
            >
              <FiChevronsLeft size={18} />
            </button>
          )}
        </div>

        {!isAdminOpen && (
          <button
            onClick={() => setAdminIsOpen(true)}
            className="mx-auto mt-3 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
            aria-label="Expand menu"
          >
            <FiChevronsRight size={18} />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          {GROUPED_SECTIONS.map((group) => (
            <div key={group.label} className="mb-6 last:mb-0">
              {isAdminOpen ? (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {group.label}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-8 bg-gray-100" />
              )}

              <ul className="space-y-0.5">
                {group.sections.map((section) => {
                  const isExpanded = expandedSections[section.Name];
                  const hasActiveChild = section.Tasks.some((t) =>
                    isActivePath(router.pathname, t.href),
                  );
                  const sectionBadge = section.Tasks.reduce(
                    (sum, t) => sum + (getTaskBadge(t) || 0),
                    0,
                  );

                  return (
                    <li key={section.Name}>
                      <button
                        onClick={() => {
                          if (isAdminOpen) {
                            toggleSection(section.Name);
                          } else {
                            setAdminIsOpen(true);
                            setExpandedSections((prev) => ({
                              ...prev,
                              [section.Name]: true,
                            }));
                          }
                        }}
                        title={isAdminOpen ? undefined : section.Name}
                        aria-expanded={isAdminOpen ? !!isExpanded : undefined}
                        className={`group relative flex w-full items-center rounded-lg px-3 py-2.5 transition-colors duration-200
                          ${isAdminOpen ? 'justify-between' : 'justify-center'}
                          ${
                            hasActiveChild
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <span className="flex min-w-0 items-center">
                          <span
                            className={`shrink-0 text-lg transition-colors ${
                              hasActiveChild
                                ? 'text-gray-900'
                                : 'text-gray-400 group-hover:text-gray-600'
                            }`}
                          >
                            {section.Icon}
                          </span>
                          {isAdminOpen && (
                            <span className="ml-3 truncate text-sm font-medium">
                              {section.Name}
                            </span>
                          )}
                        </span>

                        {isAdminOpen ? (
                          <span className="flex items-center gap-1.5">
                            {sectionBadge > 0 && !isExpanded && (
                              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium leading-none text-red-700">
                                {sectionBadge}
                              </span>
                            )}
                            <span className="text-gray-400">
                              {isExpanded ? (
                                <FiChevronDown size={15} />
                              ) : (
                                <FiChevronRight size={15} />
                              )}
                            </span>
                          </span>
                        ) : (
                          sectionBadge > 0 && (
                            <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                          )
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {isAdminOpen && isExpanded && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-[1.4rem] mt-0.5 space-y-0.5 overflow-hidden border-l border-gray-100 pl-3"
                          >
                            {section.Tasks.map((task) => {
                              const isActive = isActivePath(
                                router.pathname,
                                task.href,
                              );
                              const badgeCount = getTaskBadge(task);

                              return (
                                <li key={task.href}>
                                  <Link
                                    href={task.href}
                                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors
                                      ${
                                        isActive
                                          ? 'bg-gray-900 font-medium text-white'
                                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                      }`}
                                  >
                                    <span className="truncate">
                                      {task.label}
                                    </span>
                                    {badgeCount > 0 && (
                                      <span
                                        className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-none ${
                                          isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                      >
                                        {badgeCount}
                                      </span>
                                    )}
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
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 p-3">
          {isAdminOpen ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                <div className="relative shrink-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-900">
                      <span className="text-sm font-semibold text-white">
                        {getInitials(user?.displayName)}
                      </span>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {contactLine}
                  </p>
                </div>
              </div>
              <Link
                href="/"
                className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <FiShoppingBag
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600"
                />
                <span>Back to Store</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative"
                title={`${displayName} · ${contactLine}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-900">
                  <span className="text-sm font-semibold text-white">
                    {getInitials(user?.displayName)}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <Link
                href="/"
                title="Back to Store"
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                <FiShoppingBag size={16} />
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminDrawer;
