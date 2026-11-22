import React from 'react';
import { FiLock } from 'react-icons/fi';
import { useAdminAccess } from '../../Contexts/AdminAccessContext';
import { AdminPage, Button, EmptyState, Section } from './AdminUI';

// Shown in place of an admin page the signed-in staff member's role doesn't
// cover (see PAGE_RULES in utils/adminAccess.js).
export function NoAccess() {
  const { role } = useAdminAccess();
  return (
    <AdminPage title="No access" width="narrow">
      <Section bodyClassName="p-0">
        <EmptyState
          icon={<FiLock />}
          title="You don't have access to this page"
          description={
            role?.name
              ? `Your role (${role.name}) doesn't include it. Ask an Owner if you need access.`
              : "Your role doesn't include it. Ask an Owner if you need access."
          }
          action={
            <Button href="/admin" variant="secondary">
              Back to admin home
            </Button>
          }
        />
      </Section>
    </AdminPage>
  );
}
