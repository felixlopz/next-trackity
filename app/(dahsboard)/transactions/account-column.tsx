import { useEditAccountSheet } from "@/features/accounts/hooks/use-edit-account-sheet";

type Props = {
  account: string | null;
  accountId: string;
};

const AccountColumn = ({ account, accountId }: Props) => {
  const { onOpen: onOpenAccount } = useEditAccountSheet();

  const onClick = () => {
    onOpenAccount(accountId);
  };
  return (
    <div
      onClick={onClick}
      className="flex items-center cursor-pointer hover:underline"
    >
      {account}
    </div>
  );
};

export default AccountColumn;
