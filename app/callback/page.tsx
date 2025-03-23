type SearchParams = Promise<{ id: string }>;

async function Callback({ searchParams }: { searchParams: SearchParams }) {
	const { id } = await searchParams;
	return <p className="p-2">{id}</p>;
}

export default Callback;
