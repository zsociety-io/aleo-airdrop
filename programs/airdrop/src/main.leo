import token_registry.aleo;


program token_registry_airdrop_32b.aleo {
    mapping projects: field => Project;
    mapping claimed: field => bool;
    mapping balances: field => u128;


    struct Project {
        admin: address,
        token_id: field,
        merkle_root: field
    }
    
    struct Airdrop {
        project_id: field,
        recipient: address,
        amount: u128
    }


    inline compute_root(
        leaf: field,
        leaf_index: u32,
        path: [field; 32],
    ) -> field {
        let node: field = leaf;
        let node_index: u32 = leaf_index;
        for i: u16 in 0u16..32u16 {
            let to_hash: [field; 2] = (node_index.mod(2u32) == 0u32) ?
                [node, path[i]] :
                [path[i], node];
            node = BHP256::hash_to_field(to_hash);
            node_index = node_index.div(2u32);
        }
        return node;
    }


    async transition create_airdrop_project(
        public project_id: field,
        public token_id: field,
        public merkle_root: field,
        public total_amount: u128
    ) -> Future {
        let transfer_future: Future = token_registry.aleo/transfer_public_as_signer(
            token_id, self.address, total_amount
        );
        let create_airdrop_project_future: Future = finalize_create_airdrop_project(
            project_id,
            self.caller,
            token_id,
            merkle_root,
            total_amount,
            transfer_future
        );
        return create_airdrop_project_future;
    }
    async function finalize_create_airdrop_project(
        project_id: field,
        admin: address,
        token_id: field,
        merkle_root: field,
        total_amount: u128,
        transfer_future: Future
    ){
        let project: Project = Project {
            admin: admin,
            token_id: token_id,
            merkle_root: merkle_root
        };
        assert(projects.contains(project_id).not());
        projects.set(project_id, project);
        balances.set(project_id, total_amount);
        transfer_future.await();
    }


    async transition update_airdrop_project(
        public project_id: field,
        public new_admin: address,
        public new_merkle_root: field
    ) -> Future {
        let update_airdrop_project_future: Future = finalize_update_airdrop_project(
            project_id,
            self.caller,
            new_admin,
            new_merkle_root
        );
        return update_airdrop_project_future;
    }
    async function finalize_update_airdrop_project(
        project_id: field,
        caller: address,
        new_admin: address,
        new_merkle_root: field
    ){
        let old_project: Project = projects.get(project_id);
        assert_eq(caller, old_project.admin);
        let new_project: Project = Project {
            admin: new_admin,
            token_id: old_project.token_id,
            merkle_root: new_merkle_root
        };
        projects.set(project_id, new_project);
    }


    async transition claim_airdrop(
        public project_id: field,
        public token_id: field,
        public merkle_root: field,
        private randomizer: scalar,
        public amount: u128,
        private leaf_index: u32,
        private leaf_path: [field; 32]
    ) -> (token_registry.aleo/Token, Future) {
        let airdrop: Airdrop = Airdrop {
            project_id: project_id,
            recipient: self.signer,
            amount: amount,
        };
        let airdrop_hash: field = BHP256::hash_to_field(airdrop);
        let leaf_commit: field = BHP256::commit_to_field(airdrop_hash, randomizer);
        let computed_root: field = compute_root(leaf_commit, leaf_index, leaf_path);
        assert_eq(computed_root, merkle_root);
        let (token, transfer_future): (
            token_registry.aleo/Token, Future
        ) = token_registry.aleo/transfer_public_to_private(
            token_id, self.signer, amount, false
        );
        let claim_airdrop_future: Future = finalize_claim_airdrop(
            leaf_commit, project_id, merkle_root, token_id, amount, transfer_future
        );
        return (token, claim_airdrop_future);
    }
    async function finalize_claim_airdrop(
        leaf_commit: field, 
        project_id: field,
        merkle_root: field,
        token_id: field,
        amount: u128,
        transfer_future: Future
    ){
        assert(claimed.contains(leaf_commit).not());
        claimed.set(leaf_commit, true);

        let project: Project = projects.get(project_id);
        assert_eq(merkle_root, project.merkle_root);
        assert_eq(token_id, project.token_id);

        let balance: u128 = balances.get(project_id);
        balances.set(project_id, balance - amount);

        transfer_future.await();
    }
}
