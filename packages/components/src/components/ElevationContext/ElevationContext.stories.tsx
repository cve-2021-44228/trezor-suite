import { ReactNode } from 'react';

import { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import {
    Elevation,
    borders,
    mapElevationToBackground,
    mapElevationToBorder,
    spacingsPx,
} from '@trezor/theme';

import { Card } from '../Card/Card';
import { Modal } from '../modals/Modal/Modal';
import { Textarea } from '../form/Textarea/Textarea';
import {
    useElevation,
    ElevationContext as ElevationContextComponent,
    ElevationDown,
    ElevationUp,
} from './ElevationContext';

const UiBox = styled.div<{ $elevation: Elevation }>`
    background-color: ${mapElevationToBackground};
    border: 1px solid ${mapElevationToBorder};
    padding: ${spacingsPx.sm};
    border-radius: ${borders.radii.sm};
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${spacingsPx.sm};
`;

const meta: Meta = {
    title: 'ElevationContext',
} as Meta;
export default meta;

const Wrapper = styled.div<{ $elevation: Elevation }>`
    display: flex;
    flex-direction: column;
    gap: ${spacingsPx.sm};
    background-color: ${mapElevationToBackground};
    padding-bottom: ${spacingsPx.lg};
    width: 100%;
`;

const Background = ({ children }: { children: ReactNode }) => {
    const { elevation } = useElevation();

    return <Wrapper $elevation={elevation}>{children}</Wrapper>;
};

const TextareaExtenderStyled = styled.div<{ $elevation: Elevation }>`
    padding: 20px;
    border: 1px solid red;
    background-color: ${mapElevationToBackground};
`;

const TextareaExtender = ({ children }: { children: ReactNode }) => {
    // It is important to do `useElevation` in separate component.
    // This way we get +1 elevation.
    // So in this case it will be 2 same as the Textarea that is passed as children here.
    const { elevation } = useElevation();

    return (
        <TextareaExtenderStyled $elevation={elevation}>
            Extending area on elevation {elevation}
            {children}
        </TextareaExtenderStyled>
    );
};

const Box = ({ children }: { children?: ReactNode }) => {
    const { elevation } = useElevation();

    return (
        <UiBox $elevation={elevation}>
            <div>Elevation: {elevation}</div>
            <ElevationUp>{children}</ElevationUp>
        </UiBox>
    );
};

export const ElevationContext: StoryObj = {
    render: () => (
        <ElevationContextComponent baseElevation={-1}>
            <Background>
                <ElevationDown>
                    <Box />
                </ElevationDown>

                <ElevationUp>
                    <Box>
                        <Box>
                            <Box>
                                <Box>
                                    <Box />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </ElevationUp>
            </Background>

            <Background>
                <Modal>
                    Modal content
                    <Card>Card inside of a Modal</Card>
                </Modal>
            </Background>

            <Background>
                <Card>
                    Card and Textarea inside it wrapped in the &quot;extender&quot; component with
                    same elevation as the Textarea has.
                    <TextareaExtender>
                        <Textarea>
                            &quot;If you don’t believe it or don’t get it, I don’t have the time to
                            try to convince you, sorry.&quot; ― Satoshi Nakamoto
                        </Textarea>
                    </TextareaExtender>
                </Card>
            </Background>
        </ElevationContextComponent>
    ),
};
