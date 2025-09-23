import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

describe('Input', () => {
  it('基本的な入力フィールドが正しく表示される', () => {
    render(<Input placeholder="テスト入力" />);
    
    const input = screen.getByPlaceholderText('テスト入力');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('ラベルが正しく表示される', () => {
    render(<Input label="ユーザー名" name="username" />);
    
    const label = screen.getByText('ユーザー名');
    const input = screen.getByRole('textbox');
    
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('id', 'username');
  });

  it('必須項目のアスタリスクが表示される', () => {
    render(<Input label="メールアドレス" required />);
    
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500');
  });

  it('入力値の変更が正しく処理される', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'テスト値' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'テスト値' })
    }));
  });

  it('value propsが正しく反映される', () => {
    render(<Input value="初期値" onChange={() => {}} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('初期値');
  });

  it('placeholder が正しく設定される', () => {
    render(<Input placeholder="何か入力してください" />);
    
    const input = screen.getByPlaceholderText('何か入力してください');
    expect(input).toBeInTheDocument();
  });

  it('disabled状態が正しく適用される', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });

  it('required属性が正しく設定される', () => {
    render(<Input required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('エラーメッセージが表示される', () => {
    render(<Input error="入力が必要です" />);
    
    const errorMessage = screen.getByText('入力が必要です');
    const input = screen.getByRole('textbox');
    
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
    expect(input).toHaveClass('border-red-300');
  });

  describe('入力タイプ', () => {
    it('email type が正しく設定される', () => {
      render(<Input type="email" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('password type が正しく設定される', () => {
      render(<Input type="password" />);
      
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('number type が正しく設定される', () => {
      render(<Input type="number" />);
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  it('name属性が正しく設定される', () => {
    render(<Input name="testField" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'testField');
    expect(input).toHaveAttribute('id', 'testField');
  });

  it('カスタムクラス名が追加される', () => {
    render(<Input className="custom-input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('その他のHTML属性が正しく渡される', () => {
    render(<Input data-testid="test-input" maxLength={10} />);
    
    const input = screen.getByTestId('test-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('maxlength', '10');
  });

  it('ラベルなしでも正しく動作する', () => {
    render(<Input placeholder="ラベルなし" />);
    
    const input = screen.getByPlaceholderText('ラベルなし');
    expect(input).toBeInTheDocument();
    
    const label = screen.queryByText(/ラベル/);
    expect(label).not.toBeInTheDocument();
  });

  it('エラーなしでも正しく動作する', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
    
    const errorMessage = screen.queryByText(/エラー/);
    expect(errorMessage).not.toBeInTheDocument();
  });
});