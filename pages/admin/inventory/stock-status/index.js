import { FiBox } from 'react-icons/fi';
import { ComingSoon } from '../../../../components/Admin';

const StockStatus = () => (
  <ComingSoon
    title="Stock status"
    description="Current stock levels across all products."
    icon={<FiBox />}
  />
);

export default StockStatus;
