import { format } from "date-fns";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  BarChart,
  Tooltip,
  Bar,
} from "recharts";
import CustomTooltip from "@/components/custom-tooltip";

type Props = {
  data?: {
    date: string;
    income: number;
    expenses: number;
  }[];
};

const BarVariant = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => {
            return format(value, "dd MMM");
          }}
        />
        <Tooltip content={<CustomTooltip />} />

        <Bar dataKey="income" fill="#3d82f6" className="drop-shadow-sm" />
        <Bar dataKey="expenses" fill="#f43f5e" className="drop-shadow-sm" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarVariant;
