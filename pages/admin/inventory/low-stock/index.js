import { FiAlertTriangle } from 'react-icons/fi';
import { ComingSoon } from '../../../../components/Admin';

const LowStock = () => (
  <ComingSoon
    title="Low stock alerts"
    description="Products that are running low and need restocking."
    icon={<FiAlertTriangle />}
  />
);

export default LowStock;
