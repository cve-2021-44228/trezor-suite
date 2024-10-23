import { sortByCoin, getFailedAccounts, accountSearchFn } from '@suite-common/wallet-utils';
import { Account } from '@suite-common/wallet-types';
import {
    useAccountSearch,
    useDiscovery,
    useSelector,
    useDefaultAccountLabel,
} from 'src/hooks/suite';
import { selectAccounts, selectDevice } from '@suite-common/wallet-core';
import { selectAccountLabels } from 'src/reducers/suite/metadataReducer';
import { Translation } from 'src/components/suite';
import { AccountItemSkeleton } from './AccountItemSkeleton';
import { AccountGroup } from './AccountGroup';
import { AccountsMenuNotice } from './AccountsMenuNotice';
import { spacings } from '@trezor/theme';
import { Column } from '@trezor/components';
import { AccountSection } from './AccountSection';

interface AccountListProps {
    onItemClick?: () => void;
}

export const AccountsList = ({ onItemClick }: AccountListProps) => {
    const device = useSelector(selectDevice);
    const accounts = useSelector(selectAccounts);
    const selectedAccount = useSelector(state => state.wallet.selectedAccount);
    const coinjoinIsPreloading = useSelector(state => state.wallet.coinjoin.isPreloading);
    const accountLabels = useSelector(selectAccountLabels);
    const { getDefaultAccountLabel } = useDefaultAccountLabel();

    const { discovery, getDiscoveryStatus } = useDiscovery();
    const { coinFilter, searchString } = useAccountSearch();
    const discoveryStatus = getDiscoveryStatus();

    const discoveryInProgress = discoveryStatus && discoveryStatus.status === 'loading';

    if (!device || !discovery) {
        return null;
    }

    const failed = getFailedAccounts(discovery);

    const list = sortByCoin(
        accounts.filter(a => a.deviceState === device.state?.staticSessionId).concat(failed),
    );
    const filteredAccounts =
        searchString || coinFilter
            ? list.filter(account => {
                  const { key, accountType, symbol, index } = account;
                  const accountLabel = accountLabels.hasOwnProperty(key)
                      ? accountLabels[key]
                      : getDefaultAccountLabel({ accountType, symbol, index });

                  return accountSearchFn(account, searchString, coinFilter, accountLabel);
              })
            : list;

    const filterAccountsByType = (type: Account['accountType']) =>
        filteredAccounts.filter(a => a.accountType === type && (!a.empty || a.visible));

    // always show first "normal" account even if they are empty
    const normalAccounts = filteredAccounts.filter(
        a => a.accountType === 'normal' && (a.index === 0 || !a.empty || a.visible),
    );
    const coinjoinAccounts = filterAccountsByType('coinjoin');
    const taprootAccounts = filterAccountsByType('taproot');
    const segwitAccounts = filterAccountsByType('segwit');
    const legacyAccounts = filterAccountsByType('legacy');
    const ledgerAccounts = filterAccountsByType('ledger');

    const { params } = selectedAccount;

    const keepOpen = (type: Account['accountType']) =>
        params?.accountType === type || // selected account is from this group
        (type === 'coinjoin' && coinjoinIsPreloading) || // coinjoin account is requested but not yet created
        (!!searchString && searchString.length > 0) || // filter by search string is active
        type === 'normal'; // always keep normal accounts open

    const isSelected = (account: Account) =>
        params &&
        account.symbol === params.symbol &&
        account.accountType === params.accountType &&
        account.index === params.accountIndex;

    const buildGroup = (type: Account['accountType'], accounts: Account[], hideLabel?: boolean) => {
        const groupHasBalance = accounts.some(account => account.availableBalance !== '0');

        if (
            !accounts.length &&
            type !== 'normal' &&
            (type !== 'coinjoin' || !coinjoinIsPreloading)
        ) {
            // hide empty groups except normal and preloading coinjoin to show skeletons
            return;
        }

        const isSkeletonShown =
            discoveryInProgress || (type === 'coinjoin' && coinjoinIsPreloading);

        return (
            <AccountGroup
                key={`${device.state}-${type}`}
                type={type}
                hideLabel={hideLabel}
                hasBalance={groupHasBalance}
                keepOpen={keepOpen(type)}
            >
                {accounts.map(account => {
                    const selected = !!isSelected(account);

                    return (
                        <AccountSection
                            key={account.key}
                            account={account}
                            selected={selected}
                            accountLabel={accountLabels[account.key]}
                            onItemClick={onItemClick}
                        />
                    );
                })}
                {isSkeletonShown && <AccountItemSkeleton />}
            </AccountGroup>
        );
    };

    if (filteredAccounts.length > 0) {
        return (
            <Column gap={spacings.xs} alignItems="stretch" margin={{ bottom: spacings.lg }}>
                {buildGroup('coinjoin', coinjoinAccounts)}
                {buildGroup('normal', normalAccounts, coinjoinAccounts.length === null)}
                {buildGroup('taproot', taprootAccounts)}
                {buildGroup('segwit', segwitAccounts)}
                {buildGroup('legacy', legacyAccounts)}
                {buildGroup('ledger', ledgerAccounts)}
            </Column>
        );
    }

    if (discoveryInProgress) {
        return <AccountItemSkeleton />;
    }

    return (
        <AccountsMenuNotice>
            <Translation
                id={!searchString ? 'TR_ACCOUNT_NO_ACCOUNTS' : 'TR_ACCOUNT_SEARCH_NO_RESULTS'}
            />
        </AccountsMenuNotice>
    );
};
