<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('share-api-401');
uses()->group('api-401');

beforeEach(function (): void {
    $this->createUsers();
});

describe('401', function (): void {
    test('create share request api', function (): void {
        $this->postJson('/api/share', [
            'entity_ids' => [1, 2],
            'entity_type' => 'article',
            'user_ids' => [1],
        ])
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    });

    test('get received requests api', function (): void {
        $this->getJson('/api/share/received')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    });

    test('get sent requests api', function (): void {
        $this->getJson('/api/share/sent')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    });

    test('get pending count api', function (): void {
        $this->getJson('/api/share/count')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    });

    test('accept share request api', function (): void {
        $this->postJson('/api/share/1/accept')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    });

    test('reject share request api', function (): void {
        $this->postJson('/api/share/1/reject')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    });

    test('cancel share request api', function (): void {
        $this->postJson('/api/share/1/cancel')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    });
});
