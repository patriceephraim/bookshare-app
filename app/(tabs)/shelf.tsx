import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Plus } from 'lucide-react-native';
import { MOCK_MY_BOOKS, MOCK_BORROWED_BOOKS } from '@/lib/mock-data';
import { BookCard } from '@/components/ui/BookCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ME } from '@/lib/mock-data';

type Tab = 'mine' | 'borrowed';

export default function ShelfScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('mine');

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-5 border-b border-cream-200">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="font-serif text-2xl text-ink-900">My Shelf</Text>
              <Text className="font-sans text-sm text-ink-500">{ME.neighborhood}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.8}>
              <Avatar initials={ME.initials} size="md" colorIndex={0} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 mt-5">
            {[
              { value: ME.booksShared, label: 'shared' },
              { value: ME.booksBorrowed, label: 'borrowed' },
              { value: 2, label: 'active loans' },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 bg-cream-100 rounded-card p-3 items-center border border-cream-200">
                <Text className="font-serif-bold text-2xl text-ink-900">{stat.value}</Text>
                <Text className="font-sans text-xs text-ink-500 mt-0.5">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-cream-200 bg-cream-50">
          {(['mine', 'borrowed'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              className="flex-1 py-3.5 items-center"
              activeOpacity={0.7}
            >
              <Text
                className={`font-sans-semibold text-sm ${
                  activeTab === t ? 'text-teal-500' : 'text-ink-300'
                }`}
              >
                {t === 'mine' ? 'My Books' : 'Borrowed'}
              </Text>
              {activeTab === t && (
                <View className="absolute bottom-0 left-8 right-8 h-0.5 bg-teal-500 rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Book list */}
        <View className="px-5 pt-5 gap-3">
          {activeTab === 'mine' ? (
            MOCK_MY_BOOKS.length > 0 ? (
              <>
                {MOCK_MY_BOOKS.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onPress={() => router.push(`/listing/${book.id}`)}
                    showDistance={false}
                  />
                ))}
                <TouchableOpacity
                  onPress={() => router.push('/add-book/camera')}
                  className="flex-row items-center justify-center gap-3 border border-dashed border-cream-200 rounded-card py-4"
                  activeOpacity={0.7}
                >
                  <Plus size={16} color="#B5AB99" strokeWidth={1.75} />
                  <Text className="font-sans-medium text-sm text-ink-300">Add another book</Text>
                </TouchableOpacity>
              </>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Your shelf is empty"
                message="Share the books sitting on your shelf with neighbours who'll actually read them."
                action={
                  <Button
                    label="Add your first book"
                    onPress={() => router.push('/add-book/camera')}
                  />
                }
              />
            )
          ) : MOCK_BORROWED_BOOKS.length > 0 ? (
            MOCK_BORROWED_BOOKS.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onPress={() => router.push('/loan/loan1')}
                showDistance={false}
              />
            ))
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Nothing borrowed yet"
              message="Browse the map and request a book from a neighbour to get started."
            />
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      {activeTab === 'mine' && (
        <TouchableOpacity
          onPress={() => router.push('/add-book/camera')}
          className="absolute bottom-8 right-6 w-14 h-14 bg-teal-500 rounded-full items-center justify-center"
          style={{
            shadowColor: '#1A3530',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
          } as any}
          activeOpacity={0.85}
        >
          <Plus size={24} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
