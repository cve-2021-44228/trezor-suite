import { useArgs } from '@storybook/client-api';
import styled from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

import { Radio as RadioComponent, RadioProps, radioVariants } from './Radio';
import { H2 } from '../../typography/Heading/Heading';
import { getFramePropsStory } from '../../../utils/frameProps';
import { allowedCheckboxFrameProps } from '../Checkbox/Checkbox';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;

    & > * {
        padding: 10px;
    }
`;

const meta: Meta = {
    title: 'Form',
    component: RadioComponent,
} as Meta;
export default meta;

export const RadioButton: StoryObj<RadioProps> = {
    render: ({ ...args }) => {
        // eslint-disable-next-line
        const [{ isChecked }, updateArgs] = useArgs();
        const handleIsChecked = () => updateArgs({ isChecked: !isChecked });

        return (
            <RadioComponent {...args} onClick={handleIsChecked} isChecked={isChecked}>
                {args.children}
            </RadioComponent>
        );
    },
    args: {
        children: 'RadioButton',
        variant: 'primary',
        isChecked: false,
        isDisabled: false,
        labelAlignment: 'right',
        verticalAlignment: 'top',
        ...getFramePropsStory(allowedCheckboxFrameProps).args,
    },
    argTypes: {
        variant: {
            control: {
                type: 'radio',
            },
            options: radioVariants,
        },
        labelAlignment: {
            control: {
                type: 'radio',
            },
            options: ['left', 'right'],
        },
        verticalAlignment: {
            control: {
                type: 'radio',
            },
            options: ['top', 'center'],
        },
        ...getFramePropsStory(allowedCheckboxFrameProps).argTypes,
    },
};

export const RadioButtonGroup: StoryObj = {
    render: () => {
        // eslint-disable-next-line
        const [{ option }, updateArgs] = useArgs();

        const setOption = (option2: string) => updateArgs({ option: option2 });

        return (
            <Wrapper>
                <RadioComponent
                    onClick={() => setOption('option1')}
                    isChecked={option === 'option1'}
                >
                    <div>
                        <H2>Some heading</H2>
                        First option (example of custom content)
                    </div>
                </RadioComponent>
                <RadioComponent
                    onClick={() => setOption('option2')}
                    isChecked={option === 'option2'}
                >
                    Second option
                </RadioComponent>
                <RadioComponent
                    onClick={() => setOption('option3')}
                    isChecked={option === 'option3'}
                >
                    Third option
                </RadioComponent>
            </Wrapper>
        );
    },
    args: { option: 'option1' },
};
