const BookingCard = ({ booking }) => {
  return (
    <div className="bg-gray-200 shadow-md rounded-2xl p-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center transition hover:shadow-xl">
      <div>
        <h3 className="font-semibold text-lg text-textDark">{booking.service}</h3>
        <p className="text-textLight">
          {new Date(booking.slot_time).toLocaleString()} - {booking.status}
        </p>
        <p className="text-muted">{booking.provider_name}</p>
      </div>
    </div>
  );
};

export default BookingCard;
