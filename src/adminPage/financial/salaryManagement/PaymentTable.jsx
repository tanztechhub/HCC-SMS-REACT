import SalaryPersonRow from "./SalaryPersonRow"

export default function PaymentTable({ data, type, selectedMonth, selectedYear, formatCurrency, onProcessPayment, onAddBonus }) {
  const filteredData = data.map((person) => ({
    ...person,
    salaryPayments: person.salaryPayments.filter(
      (payment) =>
        (!selectedMonth || payment.month === selectedMonth) && (!selectedYear || payment.year === Number(selectedYear)),
    ),
  }))

  return (
    <div className="space-y-2">
      {filteredData.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-6">No {type} found</p>
      ) : (
        filteredData.map((person) => (
          <SalaryPersonRow
            key={person._id}
            person={person}
            type={type}
            formatCurrency={formatCurrency}
            onProcessPayment={onProcessPayment}
            onAddBonus={onAddBonus}
          />
        ))
      )}
    </div>
  )
}
