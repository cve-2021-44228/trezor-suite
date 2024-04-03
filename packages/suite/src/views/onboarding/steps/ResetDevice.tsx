import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { selectDevice } from '@suite-common/wallet-core';
import * as STEP from 'src/constants/onboarding/steps';
import { OnboardingButtonBack, OptionsWrapper, OnboardingStepBox } from 'src/components/onboarding';
import { Translation } from 'src/components/suite';
import { useDispatch, useSelector, useOnboarding, useDevice } from 'src/hooks/suite';
import { resetDevice } from 'src/actions/settings/deviceSettingsActions';
import { selectIsActionAbortable } from 'src/reducers/suite/suiteReducer';
import { Button, Divider, Text } from '@trezor/components';
import { BackupType, SelectBackupType, defaultBackupTypeMap } from './SelectBackupType';
import { DeviceModelInternal } from '@trezor/connect';

const SelectWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const canChooseBackupType = (device: DeviceModelInternal) => device !== DeviceModelInternal.T1B1;

export const ResetDeviceStep = () => {
    const { isLocked } = useDevice();
    const device = useSelector(selectDevice);
    const isActionAbortable = useSelector(selectIsActionAbortable);

    const deviceModel = device?.features?.internal_model;

    const [submitted, setSubmitted] = useState(false);
    const [backupType, setBackupType] = useState<BackupType>(
        deviceModel !== undefined ? defaultBackupTypeMap[deviceModel] : 'shamir-default',
    );
    const { goToPreviousStep, goToNextStep, updateAnalytics } = useOnboarding();

    const dispatch = useDispatch();

    const isWaitingForConfirmation =
        device?.buttonRequests.some(
            r => r.code === 'ButtonRequest_ResetDevice' || r.code === 'ButtonRequest_ProtectCall',
        ) && !submitted; // ButtonRequest_ResetDevice is for T2T1, ButtonRequest_ProtectCall for T1B1

    const isDeviceLocked = isLocked();

    const onResetDevice = useCallback(
        async (params?: Parameters<typeof resetDevice>[0]) => {
            setSubmitted(false);

            const result = await dispatch(resetDevice(params));

            setSubmitted(true);

            if (result?.success) {
                goToNextStep(STEP.ID_SECURITY_STEP);
            }
        },
        [dispatch, goToNextStep],
    );

    const handleSubmit = useCallback(
        async (type: BackupType) => {
            switch (type) {
                case 'shamir-default':
                    await onResetDevice({ backup_type: 1 }); // Todo: add number of shards = 1/1
                    break;
                case 'shamir-advance':
                    await onResetDevice({ backup_type: 1 }); // Todo: add number of shards = n/m (select on device?)
                    break;
                case '12-words':
                    await onResetDevice({ backup_type: 0, strength: 128 });
                    break;
                case '24-words':
                    await onResetDevice({ backup_type: 0, strength: 256 });
                    break;
            }

            updateAnalytics({ recoveryType: undefined, seedType: type });
        },
        [updateAnalytics, onResetDevice],
    );

    useEffect(() => {
        if (deviceModel !== undefined && !canChooseBackupType(deviceModel)) {
            handleSubmit(defaultBackupTypeMap[deviceModel]);
        }
    }, [deviceModel, handleSubmit]);

    // this step expects device
    if (!device || !device.features) {
        return null;
    }

    const showSelect = !isWaitingForConfirmation && !isDeviceLocked;
    const canChoseBackupType = deviceModel !== undefined && canChooseBackupType(deviceModel);

    return (
        <OnboardingStepBox
            image="KEY"
            heading={<Translation id="TR_ONBOARDING_GENERATE_SEED" />}
            description={
                canChoseBackupType ? (
                    <Translation
                        id="TR_ONBOARDING_SELECT_SEED_TYPE"
                        values={{
                            primary: chunks => <Text variant="primary">{chunks}</Text>,
                        }}
                    />
                ) : (
                    <Translation id="TR_ONBOARDING_CANNOT_SELECT_SEED_TYPE" />
                )
            }
            device={isWaitingForConfirmation ? device : undefined}
            isActionAbortable={isActionAbortable}
            outerActions={
                showSelect && (
                    // There is no point to show back button if user can't click it because confirmOnDevice bubble is active
                    <OnboardingButtonBack onClick={() => goToPreviousStep()} />
                )
            }
            variant="small"
        >
            {showSelect ? (
                <OptionsWrapper $fullWidth={true}>
                    <SelectWrapper>
                        {canChoseBackupType && (
                            <>
                                <SelectBackupType
                                    selected={backupType}
                                    onSelect={setBackupType}
                                    isDisabled={isDeviceLocked}
                                />
                                <Divider />
                            </>
                        )}
                        <ButtonWrapper>
                            <Button
                                variant="primary"
                                isDisabled={isDeviceLocked}
                                onClick={() => handleSubmit(backupType)}
                            >
                                <Translation id="TR_ONBOARDING_SELECT_SEED_TYPE_CONFIRM" />
                            </Button>
                        </ButtonWrapper>
                    </SelectWrapper>
                </OptionsWrapper>
            ) : undefined}
        </OnboardingStepBox>
    );
};
