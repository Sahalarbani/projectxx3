import { Transaction, ShopProfile } from '../types';

export const printReceipt = (transaction: Transaction, profile: ShopProfile) => {
  const width = 300; // Approx 80mm printer width in px logic
  
  const itemsHtml = transaction.items.map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span>${item.name} x${item.quantity}</span>
      <span>${(item.price * item.quantity).toLocaleString()}</span>
    </div>
  `).join('');

  const htmlContent = `
    <html>
      <head>
        <title>Receipt ${transaction.id}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 100%; max-width: 300px; }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .bold { font-weight: bold; }
          .flex { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="bold" style="font-size: 16px;">${profile.name}</div>
          <div>${profile.address}</div>
          <div>${profile.phone}</div>
        </div>
        <div class="divider"></div>
        <div>Date: ${new Date(transaction.date).toLocaleString()}</div>
        <div>Tx ID: ${transaction.id.slice(-6)}</div>
        <div class="divider"></div>
        ${itemsHtml}
        <div class="divider"></div>
        <div class="flex bold" style="font-size: 14px;">
          <span>TOTAL</span>
          <span>Rp ${transaction.total.toLocaleString()}</span>
        </div>
        <div class="flex">
          <span>Payment</span>
          <span>${transaction.paymentMethod.toUpperCase()}</span>
        </div>
        <div class="divider"></div>
        <div class="center">${profile.footerMessage}</div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    alert("Popup blocked. Please allow popups to print receipts.");
  }
};
