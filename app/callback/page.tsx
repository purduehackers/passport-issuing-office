function Callback({ searchParams }: { searchParams: { id: string } }) {
	return <p className="p-2">{searchParams.id}</p>;
}

export default Callback;
