import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const flavorCards = [
  {
    title: 'Sunset Mango Glow',
    description:
      'Plush mango for the sweetest golden pour.',
    badge: 'Bestseller',
    image: '/drink-s-1.jpeg',
  },
  {
    title: 'Garden Verde Cooler',
    description: 'Mint, cucumber, pineapple, and ginger keep things crisp and detoxifying.',
    badge: 'Limited',
    image: '/drink-s-3.jpeg',
  },
  {
    title: 'Blooming Watermelon',
    description: 'Juicy and chilled watermelon with a kiss of ginger to refresh even the hottest afternoons.',
    badge: 'New batch',
    image: '/drink-s-2.jpeg',
  },
];

const processSteps = [
  {
    label: 'Harvest',
    detail: 'We visit our partners at dawn to select fruit at peak ripeness.',
  },
  {
    label: 'Cold-press',
    detail: 'Juice is pressed at low temperatures so color, enzymes, and vitamins stay alive.',
  },
  {
    label: 'Bottle & chill',
    detail: 'Each blend is bottled within hours, flash-chilled, and shipped the same day.',
  },
];

const quickStats = [
  { label: 'Farm partners', value: '45', accent: 'from Volta to Northern Ghana' },
  { label: 'Weekly bottles', value: '1,200+', accent: 'small, vibrant batches' },
  { label: 'Average ingredients', value: '4', accent: 'no syrups, no preservatives' },
];

const vibeTiles = [
  {
    title: 'Taste the garden path',
    description: 'Every bottle begins with bright flowers, market crates, and Ghanaian sunshine.',
    image: '/drink-b-1.jpeg',
  },
  {
    title: 'Fruit-first palette',
    description: 'Watermelon, pineapple, mint, and mango take center stage—never fillers.',
    image: '/drink-b-2.jpeg',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-50 via-brand-50 to-leaf-50 text-leaf-950">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-20">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-berry-500 shadow">
              Panaya · Natural Fruit Drinks & Cereal Mix
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-leaf-900 sm:text-5xl">
              Colorful bottles of pure sunshine, freshly pressed by Panaya.
            </h1>
            <p className="text-lg text-leaf-800">
              Panaya is a natural juice and cereal-mix kitchen in Accra. We buy the freshest fruit
              from open-air markets, blend them the same morning, and bottle juices with zero added
              sugar or preservatives. Pair them with our creamy cereal mix for a wholesome start.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop?search=juice"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-berry-500 to-leaf-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110"
              >
                Browse natural juices
              </Link>
              <Link
                href="/shop/orders"
                className="inline-flex items-center gap-2 rounded-full border border-leaf-500 px-6 py-3 text-base font-semibold text-leaf-800 hover:bg-leaf-50/40"
              >
                Track my bottles
              </Link>
            </div>
            {/* <div className="grid gap-4 rounded-3xl bg-white/70 p-5 text-sm shadow-lg sm:grid-cols-3">
              {quickStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-leaf-900">{stat.value}</p>
                  <p className="text-xs text-leaf-700">{stat.accent}</p>
                </div>
              ))}
            </div> */}
          </div>
          <div className="relative h-96 w-full">
            <Image
              src="/drink-all.jpeg"
              alt="Panaya natural juices with tropical fruit"
              fill
              priority
              className="rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-berry-500 shadow-lg">
              100% Natural
            </div>
          </div>
        </section>

        {/* Signature flavors */}
        <section className="space-y-10">
          <div className="flex flex-col items-center text-center space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-berry-500">
              Signature pours
            </p>
            <h2 className="text-3xl font-bold text-leaf-900">
              Pick the bottle that matches your mood.
            </h2>
            <p className="max-w-3xl text-lg text-leaf-800">
              We let fruit personality lead the way. Think “sunset on the terrace,” “garden yoga,”
              or “poolside daydream.” Your taste buds will tell you which vibe to choose.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {flavorCards.map((flavor) => (
              <div
                key={flavor.title}
                className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-lg shadow-rose-100"
              >
                <div className="relative h-52 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={flavor.image}
                    alt={flavor.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-berry-500">
                    {flavor.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-leaf-900">{flavor.title}</h3>
                <p className="mt-2 text-sm text-leaf-700">{flavor.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cereal mix highlight */}
        <section className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Panaya cereal mix
            </p>
            <h2 className="mt-3 text-3xl font-bold text-leaf-900">
              Creamy, nutty, ready-to-enjoy cereal bowls.
            </h2>
            <p className="mt-4 text-lg text-leaf-800">
              Our cereal mix blends toasted grains, groundnuts, tiger nuts, millet, and spices for a hearty
              breakfast or snack. Just add warm water or almond milk, stir, and enjoy with your
              favorite juice.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-leaf-700">
              <li>• No dairy powders or artificial thickeners.</li>
              <li>• Lightly sweetened with dates—never refined sugar.</li>
              <li>• Packed fresh and sealed for weekly deliveries.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/shop?search=cereal"
                className="inline-flex items-center gap-2 rounded-full bg-leaf-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-leaf-500"
              >
                Shop cereal mix
              </Link>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-berry-500">
                best paired with fruit juice
              </span>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="relative h-64 w-full overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="/bowl-of-cereal-mix.jpg"
                alt="Bowl of Panaya cereal mix"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-64 w-full overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="/cereal-mix.jpg"
                alt="Panaya cereal mix packets"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5 rounded-3xl bg-gradient-to-br from-leaf-100 via-white to-brand-100 p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-leaf-600">
              From orchard to bottle
            </p>
            <h2 className="text-3xl font-bold text-leaf-900">
              The Panaya ritual keeps every sip vibrant.
            </h2>
            <div className="grid gap-4">
              {processSteps.map((step, index) => (
                <div key={step.label} className="flex gap-4 rounded-2xl bg-white/80 p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-berry-100 text-berry-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-leaf-900">{step.label}</p>
                    <p className="text-sm text-leaf-700">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {vibeTiles.map((tile) => (
              <div key={tile.title} className="relative h-60 w-full overflow-hidden rounded-3xl shadow-lg">
                <Image src={tile.image} alt={tile.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-semibold text-white">{tile.title}</p>
                  <p className="text-sm text-white/80">{tile.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-white/50 bg-gradient-to-r from-leaf-400 via-citrus-300 to-berry-300 p-8 text-leaf-900 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-leaf-900/70">
                Your day needs fruit
              </p>
              <h2 className="text-3xl font-extrabold">
                Keep your fridge stocked with Panaya natural juices.
              </h2>
              <p className="max-w-2xl text-lg text-leaf-900">
                Subscribe for weekly drops, gift a rainbow box, or grab a limited release before it
                sells out. Each bottle is hand-labeled and delivered chilled.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-leaf-900 shadow-lg transition hover:scale-105"
            >
              Shop now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
