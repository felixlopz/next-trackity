import { AccountFilter } from "@/components/account-filter";
import { DateFilter } from "@/components/date-filter";
import { FilterType } from "@/contants/routes";

interface FiltersProps {
  filters: FilterType[];
}

const filterComponents: Record<FilterType, React.FC> = {
  AccountFilter,
  DateFilter,
};

const Filters: React.FC<FiltersProps> = ({ filters }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg:gap-x-2 h-auto lg:h-[36px] ">
      {filters.map((filterKey) => {
        const FilterComponent = filterComponents[filterKey];
        return FilterComponent ? <FilterComponent key={filterKey} /> : null;
      })}
    </div>
  );
};

export default Filters;
